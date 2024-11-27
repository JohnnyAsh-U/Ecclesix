from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from members.models import Members
from authentication.auth import AuthBackend
from .auth import JWTAuthentication
from .utils import getRefreshToken, jwtEncode, jwtDecode, generate_tokens, compare_hash
import os, pyotp, time

access_token_secret = os.getenv("ACCESS_TOKEN")
temp_token_secret = os.getenv("TEMP_TOKEN")
refresh_token_secret = os.getenv("REFRESH_TOKEN")


class Connexion(APIView):
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

        admin = Members.objects.filter(email=email).exists()
        if not admin:
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
            token, sent = admin.generate_email_verification()
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
                "device_id": user.device.id,
            }
            access, refresh = generate_tokens(new_payload)

            return Response(
                {"next": "Dashboard", "token": access},
            ).set_cookie(
                "refreshToken",
                refresh,
                httponly=True,
                samesite="lax",
                secure=os.getenv("DJANGO_ENV") == "production",
            )
        except:
            temporary_token = jwtEncode(
                {"email": email, "from": "Connexion", "next": "OTP"},
                age=10,
                secret=refresh_token_secret,
            )
            return Response(
                {
                    "token": temporary_token,
                    "next": "OTP",
                    "user": full_name,
                    "hasOTP": has_otp_key,
                }
            ).delete_cookie("refreshToken")


class VerifyEmail(APIView):
    authentication_classes = []

    def post(self, request):

        token = request.data.get("token", None)
        email_token = request.data.get("values", {}).get("email_token", None)

        if email_token is None or token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)

        if not payload or not email:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = Members.objects.filter(email=email).first()

        if not user or user.verified or not user.is_admin:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        is_valid = compare_hash(email_token, user.verification_code)

        if not is_valid:
            return Response({"success": False})

        user.verified = True
        user.verification_code = None
        user.save()

        return Response(
            {
                "token": token,
                "next": "OTP",
                "success": True,
                "email": email,
                "user": user.get_full_name(),
            }
        )


class SetupOTP(APIView):
    authentication_classes = []

    def post(self, request):

        token = request.data.get("token", None)

        if token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)
        
        print(payload, email, token)

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
