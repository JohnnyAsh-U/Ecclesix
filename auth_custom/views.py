from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from members.models import Members
from django.utils import timezone
from .auth import AuthBackend
from django.contrib.auth.hashers import make_password
from .auth import JWTAuthentication
from .utils import getRefreshToken, jwtEncode, jwtDecode, generate_tokens
import os, pyotp, uuid, datetime


access_token_secret = os.getenv("ACCESS_TOKEN")
temp_token_secret = os.getenv("TEMP_TOKEN")
refresh_token_secret = os.getenv("REFRESH_TOKEN")


class Register(APIView):
    authentication_classes = []

    def post(self, request, format=None):
        values = request.data.get("values", {})
        email = values.get("email", None)
        password = values.get("password", None)
        password2 = values.get("password2", None)

        if not email or not password or not password2 or password != password2:
            return Response(
                {"status": False, "err": "Verifiez votre mot de passe"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # to test if the user is the first admin
        total_admin = Members.objects.filter(is_admin=True)

        if total_admin.count() == 0:
            admin = Members.objects.create_superuser(
                email=email,
                password=password,
                first_name="SuperAdmin",
                last_name="SuperAdmin",
            )

        new_user = Members.objects.filter(email=email, is_admin=True, is_active=True).first()
        
        #to make sure the user is not already registered as an admin
        if not new_user or new_user.password  != "None":
            return Response(
                {"status": False, "err": "Erreur ! Impossible de s'inscrire"},
                status.HTTP_400_BAD_REQUEST,
            )
            
        #update the user row with new password
        new_user.password = make_password(password)
        new_user.save()

        #authenticate the user with the new password
        admin = AuthBackend.authenticate(request, email=email, password=password)

        token, sent, code = admin.generate_email_verification(from_view="Inscription")
        return (
            Response({"email": email, "token": token, "next": "VerifyEmail"})
            if sent
            else Response({"err": "Echec de verification"}, status.HTTP_400_BAD_REQUEST)
        )


class Login(APIView):
    authentication_classes = []

    def post(self, request, format=None):
        values = request.data.get("values", {})
        email = values.get("email", "")
        password = values.get("password", "")

        if not email or not password:
            return Response(
                {"status": False, "err": "Remplissez les champs"},
                status.HTTP_400_BAD_REQUEST,
            )

        admin = Members.objects.filter(email=email, is_admin = True, is_active= True).first()
        
        #to make sure if the password is default none then the user has to first register
        if not admin or admin.password == "None":
            return Response(
                {"status": False, "err": "Ce compte n'existe pas"},
                status.HTTP_400_BAD_REQUEST,
            )

        admin = AuthBackend.authenticate(request, email=email, password=password)
        if not admin:
            return Response(
                {"status": False, "err": "Password ou Username Incorrecte "},
                status.HTTP_400_BAD_REQUEST,
            )

        verified_email = admin.check_email_verification()

        if not verified_email:
            token, sent, code = admin.generate_email_verification(from_view="Connexion")
            return (
                Response({"email": email, "token": token, "next": "VerifyEmail"})
                if sent
                else Response(
                    {"err": "Echec de verification"}, status.HTTP_400_BAD_REQUEST
                )
            )

        full_name = admin.user.get_full_name()
        has_otp_key = admin.check_otp()
        refresh_token = getRefreshToken(request)

        # to check if the user still has a refresh token
        # if not we generate a token for verification or setup of otp
        if refresh_token is None:
            temporary_token = jwtEncode(
                {"email": email, "from": "Connexion", "next": "OTP"},
                age=10,
                secret=temp_token_secret,
            )
            return Response(
                {
                    "token": temporary_token,
                    "next": "OTP",
                    "user": full_name,
                    "hasOTP": has_otp_key,
                }
            )

        # try to check if the device id in the token is same as that in the db
        # this is to enforce the user to be logged in on a device at a time
        try:
            valid_device = admin.verify_refresh_token(
                refresh_token, refresh_token_secret
            )
            if not valid_device:
                raise Exception
            user = admin.user
            new_payload = {
                "id": user.id,
                "username": user.first_name,
                "eglise_id": user.eglise_id,
                "device_id": user.device_id,
            }
            access, refresh = generate_tokens(new_payload)

            response = Response({"next": "Dashboard", "token": access})
            response.set_cookie(
                "refreshToken",
                refresh,
                httponly=True,
                samesite="lax",
                secure=os.getenv("DJANGO_ENV") == "production",
            )

            return response
        except Exception as e:

            temporary_token = jwtEncode(
                {"email": email, "from": "Connexion", "next": "OTP"},
                age=10,
                secret=refresh_token_secret,
            )

            response = Response(
                {
                    "token": temporary_token,
                    "next": "OTP",
                    "user": full_name,
                    "hasOTP": has_otp_key,
                }
            )
            response.delete_cookie("refreshToken")

            return response


class VerifyEmail(APIView):

    authentication_classes = []

    def post(self, request):

        token = request.data.get("token", None)
        user_code = request.data.get("values", {}).get("email_token", None)

        if user_code is None or token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            user = AuthBackend.verify_email(token, user_code)
            if not user:
                return Response({"success": False})

            return Response(
                {
                    "token": token,
                    "next": "OTP",
                    "success": True,
                    "email": user.email,
                    "user": user.get_full_name(),
                }
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class SetupOTP(APIView):
    authentication_classes = []

    def post(self, request):

        token = request.data.get("token", None)

        if token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)

        if not payload or not email:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = Members.objects.filter(email=email, is_admin=True).first()

        if not user:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        secret = pyotp.random_base32()

        qr_code = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email, issuer_name="ChMS"
        )

        return Response(
            {"qrCodeUrl": qr_code, "secret": secret},
        )


class VerifyOTP(APIView):
    authentication_classes = []

    def post(self, request, format=None):

        token = request.data.get("token", None)
        otp_token = request.data.get("values", {}).get("otp_token", None)
        otp_key = request.data.get("secret", None)

        if not token or not otp_token:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            user = AuthBackend.verify_otp(token, otp_token, secret=otp_key)
            if not user:
                return Response({"success": "false"})

            device_id = str(uuid.uuid4())
            user.device_id = device_id
            user.last_login = timezone.now()

            payload = {
                "id": user.pk,
                "username": user.first_name,
                "eglise_id": user.eglise_id,
                "device_id": device_id,
            }

            user.save()

            access, refresh = generate_tokens(payload)

            response = Response({"success": "true", "token": access})
            response.set_cookie(
                "refreshToken",
                refresh,
                samesite="lax",
                secure=os.getenv("DJANGO_ENV") == "production",
                httponly=True,
            )
            return response

        except Exception as m:
            return Response(status=status.HTTP_401_UNAUTHORIZED)


class RefreshToken(APIView):
    authentication_classes = []

    def post(self, request, format=None):
        refresh_token = getRefreshToken(request)
        if not refresh_token:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        verification = jwtDecode(refresh_token, refresh_token_secret) or {}
        id = verification.get("id", None)

        if not verification or not id:
            return Response(status=status.HTTP_402_PAYMENT_REQUIRED)

        user = Members.objects.filter(id=id, is_admin=True).first()

        if not user:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        device_id = verification.get("device_id", None)
        if device_id != user.device_id:
            res = Response(status=status.HTTP_401_UNAUTHORIZED)
            res.delete_cookie("refreshToken")
            return res

        payload = {
            "id": user.pk,
            "username": user.first_name,
            "eglise_id": user.eglise_id,
            "device_id": user.device_id,
        }

        access, refresh = generate_tokens(payload)

        user.last_login = timezone.now()
        user.save()

        return Response({"token": access})
