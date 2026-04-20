import smtplib
from rest_framework.authentication import BaseAuthentication, exceptions
from rest_framework import permissions
from django.contrib.auth import authenticate as login
from django.contrib.auth.hashers import make_password
from members.models import Member
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from .utils import (
    jwtEncode,
    jwtDecode,
    generate_random_hash,
    compare_hash,
)
from members.models import Member
import os, pyotp

temp_token_secret = os.getenv("TEMP_TOKEN")
email_token_secret = os.getenv("EMAIL_TOKEN")
access_token_secret = os.getenv("ACCESS_TOKEN")
default_domain_name = os.getenv("URL")


class AuthBackend:
    """
    Authentication Class for login and register and reset password
    """

    def __init__(self, user) -> None:
        self.user = user

    @staticmethod
    def authenticate(request, **cred):
        user = login(request, **cred)
        if user and user.is_admin and user.is_active:
            return AuthBackend(user)

    def check_email_verification(self):
        return self.user.verified

    def check_otp(self):
        return True if self.user.otp_key is not None else False

    @staticmethod
    def verify_otp(token, otp_code, secret=None):
        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)
        from_func = payload.get('from', None)

        if not payload or not otp_code or not email:
            raise exceptions.AuthenticationFailed

        user = Member.objects.filter(email=email).first()

        if not user or not user.is_admin:
            raise exceptions.AuthenticationFailed

        otp_key_secret = secret or user.otp_key

        is_valid = pyotp.TOTP(otp_key_secret).verify(otp_code)

        user.otp_key = otp_key_secret

        return (user, from_func) if is_valid else (None, from_func)

    @staticmethod
    def verify_email(token, email_code):
        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)

        if not payload or not email:
            raise exceptions.NotAuthenticated

        user = Member.objects.filter(email=email).first()

        if not user or user.verified or not user.is_admin:
            raise exceptions.AuthenticationFailed

        is_valid = compare_hash(email_code, user.verification_code)

        if is_valid:
            user.verified = True
            user.verification_code = None
            user.save()

        return user if is_valid else False

    def generate_email_verification(self, from_view=None):
        if not self.check_email_verification():
            random_num, hashed = generate_random_hash()

            # update db with the hashed code
            self.user.verification_code = hashed
            self.user.save()

            # encode the user email in jwt
            payload = {
                "email": self.user.email,
                "from": from_view,
                "next": "VerifyEmail",
            }
            verification_email_status = self._send_verification_email(code=random_num)
            token = jwtEncode(payload, age=30, secret=temp_token_secret)
            return token, verification_email_status, random_num

    def _send_verification_email(self, code):
        content = render_to_string("email_template.html", context={"code": code})
        try:
            msg = EmailMultiAlternatives(
                "Verification Email",
                content,
                "Ecclesix <info@chms.site>",
                [self.user.email],
            )
            msg.content_subtype = "html"
            msg.send()
            return True
        except smtplib.SMTPException as e:
            return False

    def verify_refresh_token(self, token, secret):
        user_payload = jwtDecode(token, secret)
        if user_payload is None:
            return False
        device_id = user_payload.get("device_id", None)
        user_id = user_payload.get("id", None)
        if device_id == self.user.device_id and user_id == self.user.id:
            return True
        else:
            return False

    def send_reset_password_email(self, request=None):
        try:
            payload = {"id": self.user.id, "email": self.user.email}
            token = jwtEncode(payload, age=60, secret=email_token_secret)

            tenant_domain = None
            if request is not None:
                tenant = getattr(request, "tenant", None)
                if tenant and getattr(tenant, "domain", None):
                    tenant_domain = f"{request.scheme}://{tenant.domain}"
                else:
                    tenant_domain = f"{request.scheme}://{request.get_host()}"

            verification_link = f"{tenant_domain or default_domain_name}/reset?token={token}"
            content = render_to_string(
                "reset_password.html", context={"token_link": verification_link}
            )

            msg = EmailMultiAlternatives(
                "Verification Email",
                content,
                "Ecclesix <info@chms.site>",
                [self.user.email],
            )
            msg.content_subtype = "html"
            msg.send()
            return True
        except Exception:
            return False

    def change_password(self, password):
        self.user.password = make_password(password)
        self.user.save()


class JWTAuthentication(BaseAuthentication):

    www_authenticate_realm = "401"

    def authenticate(self, request):
        # return (Member.objects.get(id=1), None)
        try:
            header_token = str(request.META.get("HTTP_AUTHORIZATION", b""))
            access_token = header_token.split()[1]

            if not access_token:
                raise exceptions.AuthenticationFailed("AuthFailed")

            verification: dict = jwtDecode(access_token, access_token_secret)
            if not verification:
                raise exceptions.AuthenticationFailed("AuthFailed")

            id = verification["id"]
            device_id = verification["device_id"]

            user = Member.objects.get(id=id, is_active=True, is_admin=True)

            if device_id != user.device_id:
                raise exceptions.AuthenticationFailed("AuthFailed")

            return (user, None)
        except:
            raise exceptions.AuthenticationFailed("AuthFailed")

    def authenticate_header(self, request):
        return 'Error"%s"' % self.www_authenticate_realm


class CustomPermissions(permissions.BasePermission):

    def has_permission(self, request, view):
        user: Member = request.user
        all_required_perms = getattr(view, "perms", {})
        method_required_perms = all_required_perms.get(request.method, None)
        # if the method perms is not specified return false
        if method_required_perms is None:
            return False
        
        # if no perms in the method then return true
        if len(method_required_perms) == 0:
            return True

        has_perm = next(
            (True for perm in method_required_perms if user.has_perm_custom(perm)),
            False,
        )

        return bool(
            (has_perm or user.is_superuser) and user.is_active and user.is_admin
        )
