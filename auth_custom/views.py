from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from members.models import Member
from django.utils import timezone
from django.contrib.auth import logout
from .auth import AuthBackend
from .services import auth_logger
from .utils import getRefreshToken, jwtEncode, jwtDecode, generate_tokens
import os, pyotp, uuid

access_token_secret = os.getenv("ACCESS_TOKEN")
temp_token_secret = os.getenv("TEMP_TOKEN")
refresh_token_secret = os.getenv("REFRESH_TOKEN")
email_token_secret = os.getenv("EMAIL_TOKEN")


class Register(APIView):
    authentication_classes = []
    permission_classes = []

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
        # total_admin = Member.objects.filter(is_admin=True)

        # if total_admin.count() == 0:
        #     admin = Member.objects.create_superuser(
        #         email=email,
        #         password=password,
        #         first_name="SuperAdmin",
        #         last_name="SuperAdmin",
        #     )

        new_user = Member.objects.filter(
            email=email, is_admin=True, is_active=True
        ).first()

        # to make sure the user is not already registered as an admin
        if not new_user or new_user.password != "":
            return Response(
                {"status": False, "err": "Erreur ! Impossible de s'inscrire"},
                status.HTTP_400_BAD_REQUEST,
            )

        # update the user row with new password
        admin = AuthBackend(new_user)
        admin.change_password(password)

        token, sent, code = admin.generate_email_verification(from_view="Inscription")
        return (
            Response({"email": email, "token": token, "next": "VerifyEmail"})
            if sent
            else Response({"err": "Echec de verification"}, status.HTTP_400_BAD_REQUEST)
        )


class Login(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        values = request.data.get("values", {})
        email = values.get("email", "")
        password = values.get("password", "")

        if not email or not password:
            return Response(
                {"status": False, "err": "Remplissez les champs"},
                status.HTTP_400_BAD_REQUEST,
            )

        admin = Member.objects.filter(
            email=email, is_admin=True, is_active=True
        ).first()

        # to make sure if the password is default none then the user has to first register
        if not admin or admin.password == "":
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
        refresh_token = getRefreshToken(self.request)
        
        
        
        
        #this is to give direct access to superadmin@chms.com without
        #otp verification
        if admin.user.email == "superadmin@chms.site" or admin.user.email == "admin@chms.site":
            user = admin.user
            device_id = str(uuid.uuid4())
            user.device_id = device_id
            user.last_login = timezone.now()
            payload = {
                "id": user.pk,
                "username": user.first_name,
                "church_id": user.church_id,
                "device_id": device_id,
            }
            user.save()
            access, refresh = generate_tokens(payload)
            ip = request.META.get("REMOTE_ADDR", None)
            
            auth_logger(user, "Connexion", ip)
            response = Response({"next": "Dashboard", "token": access})
            response.set_cookie(
                "refreshToken",
                refresh,
                samesite="lax",
                secure=os.getenv("DJANGO_ENV") == "production",
                httponly=True,
            )
            return response




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
                "church_id": user.church_id,
                "device_id": user.device_id,
            }
            access, refresh = generate_tokens(new_payload)

            ip = request.META.get("REMOTE_ADDR", None)

            auth_logger(admin=user, resource="Connexion", ip=ip)

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


class MobileLogin(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        email = request.data.get("email", request.data)
        password = request.data.get("password", None)
     
        if not email or not password:
            print("Email or password missing")  # Debugging line
            return Response(
                {"status": False, "err": "Remplissez les champs"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_user = Member.objects.filter(
            email=email, is_admin=True, is_active=True
        ).first()

        if not existing_user or existing_user.password == "":
            return Response(
                {"status": False, "err": "Mot de passe incorrect ou compte n'existe pas"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        device_id = str(uuid.uuid4())

        admin = AuthBackend.authenticate(request, email=email, password=password)

        if not admin:
            return Response(
                {"status": False, "err": "Mot de passe incorrect ou compte n'existe pas"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not admin.user.verified:
            return Response(
                {
                    "status": False,
                    "err": "Veuillez vérifier votre adresse e-mail avant de vous connecter.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        user = admin.user
        user.device_id = device_id
        user.last_login = timezone.now()
        user.save(update_fields=["device_id", "last_login"])

        payload = {
            "id": user.pk,
            "username": user.first_name,
            "church_id": user.church_id,
            "device_id": device_id,
        }

        token = jwtEncode(payload, age=60 * 24, secret=access_token_secret)
        user_perms = user.get_all_permissions() or []
        permissions = [perm.codename for perm in user_perms]

        ip = request.META.get("REMOTE_ADDR", None)
        auth_logger(user, "Connexion Mobile", ip)

        return Response(
            {
                "token": token,
                "expiresIn": 60 * 24,
                "user": {
                    "id": str(user.pk),
                    "name": user.get_full_name() or user.email,
                    "email": user.email,
                    "role": getattr(user.role, "role_name", "SuperAdmin" if user.is_superuser else "Admin"),
                },
                "permissions": permissions,
            },
            status=status.HTTP_200_OK,
        )


class Reinitialization(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        email = request.data.get("values", {}).get("email", None)

        if not email:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        admin = Member.objects.filter(
            email=email, is_admin=True, is_active=True
        ).first()

        # to make sure if the password is not default
        if not admin or admin.password == "":
            return Response(
                {"status": False, "err": "Mot de passe incorrect ou compte n'existe pas"},
                status.HTTP_400_BAD_REQUEST,
            )

        auth_instance = AuthBackend(admin)
        token = auth_instance.send_reset_password_email()
        return (
            Response({"email": email})
            if token
            else Response({"err": "Echec de verification"}, status.HTTP_400_BAD_REQUEST)
        )


class ConfirmReinitialization(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        try:
            token = self.request.query_params["token"]
            payload = jwtDecode(token, email_token_secret) or {}
            email = payload["email"]
            id = payload["id"]
            user = Member.objects.get(email=email, id=id, is_admin=True, is_active=True)
            return Response({"email": email, "name": user.get_full_name()})
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ResetPassword(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        try:
            token = self.request.query_params["token"]
            values = self.request.data["values"]
            password = values["password"]
            password2 = values["password2"]
            if not password == password2:
                raise Exception

            payload = jwtDecode(token, email_token_secret) or {}
            email = payload["email"]
            id = payload["id"]
            user = Member.objects.get(email=email, id=id, is_admin=True, is_active=True)
            auth_instance = AuthBackend(user)
            auth_instance.change_password(password)

            temp_token = jwtEncode(
                {"email": email, "from": "Reinitialization", "next": "OTP"},
                age=5,
                secret=temp_token_secret,
            )
            return Response({"token": temp_token, "next": "OTP"})
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class VerifyEmail(APIView):

    authentication_classes = []
    permission_classes = []

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
    permission_classes = []

    def post(self, request):

        token = request.data.get("token", None)

        if token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)

        if not payload or not email:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = Member.objects.filter(email=email, is_admin=True).first()

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
    permission_classes = []

    def post(self, request, format=None):

        token = request.data.get("token", None)
        otp_token = request.data.get("values", {}).get("otp_token", None)
        otp_key = request.data.get("secret", None)

        if not token or not otp_token:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            user, from_func = AuthBackend.verify_otp(token, otp_token, secret=otp_key)
            if not user:
                return Response({"success": "false"})

            device_id = str(uuid.uuid4())
            user.device_id = device_id
            user.last_login = timezone.now()

            payload = {
                "id": user.pk,
                "username": user.first_name,
                "church_id": user.church_id,
                "device_id": device_id,
            }

            user.save()

            access, refresh = generate_tokens(payload)

            ip = request.META.get("REMOTE_ADDR", None)

            auth_logger(user, from_func, ip)

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
    permission_classes = []

    def post(self, request, format=None):
        refresh_token = getRefreshToken(self.request)
        if not refresh_token:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        verification = jwtDecode(refresh_token, refresh_token_secret) or {}
        id = verification.get("id", None)

        if not verification or not id:
            return Response(status=status.HTTP_402_PAYMENT_REQUIRED)

        user = Member.objects.filter(id=id, is_admin=True).first()

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
            "church_id": user.church_id,
            "device_id": user.device_id,
        }

        access, refresh = generate_tokens(payload)

        user.last_login = timezone.now()
        user.save()

        return Response({"token": access})


class Logout(APIView):

    permission_classes = []

    def post(self, request, format=None):
        logout(self.request)
        ip = request.META.get("REMOTE_ADDR", None)

        auth_logger(request.user, "Deconnexion", ip)
        return Response()
