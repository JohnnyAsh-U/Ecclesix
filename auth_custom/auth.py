import smtplib
from rest_framework.authentication import BaseAuthentication, exceptions
from django.contrib.auth import authenticate as login
from members.models import Members
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from .utils import jwtEncode, jwtDecode, generate_random_hash, compare_hash
from members.models import Members
import os, pyotp

temp_token_secret = os.getenv('TEMP_TOKEN')


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
    def verify_otp(token, otp_code, secret = None):
        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)
        
        if not payload or not otp_code or not email:
            raise exceptions.AuthenticationFailed
        
        user = Members.objects.filter(email=email).first()
        
        if not user or not user.is_admin:
            raise exceptions.AuthenticationFailed
        
        otp_key_secret = user.otp_key or secret 
        
        is_valid = pyotp.TOTP(otp_key_secret).verify(otp_code)
        
        user.otp_key = otp_key_secret
        
        return user if is_valid else False
        
        
    @staticmethod
    def verify_email(token, email_code):
        payload = jwtDecode(token, temp_token_secret) or {}
        email = payload.get("email", None)

        if not payload or not email:
            raise exceptions.NotAuthenticated
        
        user = Members.objects.filter(email=email).first()

        if not user or user.verified or not user.is_admin:
            raise exceptions.AuthenticationFailed

        is_valid = compare_hash(email_code, user.verification_code)
        
        if is_valid:
            user.verified = True
            user.verification_code = None
            user.save()
            
        return user if is_valid else False
    
    
    def generate_email_verification(self, from_view = None):
        if not self.check_email_verification():
            random_num, hashed = generate_random_hash()
            
            #update db with the hashed code
            self.user.verification_code = hashed
            self.user.save()
            
            #encode the user email in jwt
            payload = {
                "email": self.user.email,
                "from": from_view,
                "next": "VerifyEmail"
            }
            verification_email_status = self._send_verification_email(code=random_num)
            token = jwtEncode(payload, age=30, secret=temp_token_secret)
            return token, verification_email_status, random_num
        
        
    def _send_verification_email(self, code):
        content = render_to_string(
            "email_template.html",
            context={"code": code}
        )
        try:
            msg = EmailMultiAlternatives(
                'Verification Email',
                content,
                'Church Management System <noreply@example.com>',
                [self.user.email],
            )
            msg.content_subtype = 'html'
            msg.send()
            return True
        except smtplib.SMTPException :
            return False
        
    
    def verify_refresh_token(self, token, secret):
        user_payload = jwtDecode(token, secret)
        if user_payload is None : return False
        device_id = user_payload.get("device_id", None)
        user_id = user_payload.get("id", None)
        if device_id == self.user.device_id and user_id == self.user.id:
            return True
        else:
            return False
        





class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        request.user = "Sometheing"
        setattr(request, "user", "Something")
        return (Members.objects.get(id=1), None)
    
    
    # @staticmethod
    # def verify_refresh_token(token, secret):
    #     payload = jwtDecode(token, secret)
    #     return JWTAuthentication()
    
    
    def get_user():
        pass
        # auth = get_authorization_header(request).split()

        # if not auth or auth[0].lower() != b'basic':
        #     return None

        # if len(auth) == 1:
        #     msg = _('Invalid basic header. No credentials provided.')
        #     raise exceptions.AuthenticationFailed(msg)
        # elif len(auth) > 2:
        #     msg = _('Invalid basic header. Credentials string should not contain spaces.')
        #     raise exceptions.AuthenticationFailed(msg)

        # try:
        #     try:
        #         auth_decoded = base64.b64decode(auth[1]).decode('utf-8')
        #     except UnicodeDecodeError:
        #         auth_decoded = base64.b64decode(auth[1]).decode('latin-1')

        #     userid, password = auth_decoded.split(':', 1)
        # except (TypeError, ValueError, UnicodeDecodeError, binascii.Error):
        #     msg = _('Invalid basic header. Credentials not correctly base64 encoded.')
        #     raise exceptions.AuthenticationFailed(msg)

        # return self.authenticate_credentials(userid, password, request)

    def authenticate_credentials(self, userid, password, request=None):
        """
        Authenticate the userid and password against username and password
        with optional request for context.
        """
        # credentials = {get_user_model().USERNAME_FIELD: userid, "password": password}
        # user = authenticate(request=request, **credentials)

        # if user is None:
        #     raise exceptions.AuthenticationFailed(_("Invalid username/password."))

        # if not user.is_active:
        #     raise exceptions.AuthenticationFailed(_("User inactive or deleted."))

        # return (user, None)



# {"values":{"email":"johnashimedua@chms.com", "password":"1234"}}

# {
# "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5hc2hpbWVkdWFAY2htcy5jb20iLCJmcm9tIjoiQ29ubmV4aW9uIiwibmV4dCI6Ik9UUCIsImV4cCI6MTczMjc5NzkwMX0.13hcExAWiXZD1UPurdVmidospXnn6DHulpfE_NX_fA0",
# "values":{"otp_token": "471072"}
# }