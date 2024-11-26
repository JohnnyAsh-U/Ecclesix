import smtplib
from rest_framework.authentication import BasicAuthentication, BaseAuthentication
from django.contrib.auth import authenticate as login
from members.models import Members
import datetime, os, random, hashlib, jwt
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives


temp_token_secret = os.getenv('TEMP_TOKEN')


def generate_random_hash():
    """
    Generate random number and hashed number
    """    
    random_num = str(random.randint(100000, 999999))
    hashed_num = hashlib.sha256(random_num.encode())
    hashed_hex = hashed_num.hexdigest()
    return random_num, hashed_hex




def send_verification_email(email, code):
    content = render_to_string(
        "email_template.html",
        context={"code": code}
    )
    try:
        msg = EmailMultiAlternatives(
            'Verification Email',
            content,
            'Church Management System <noreply@example.com>',
            [email],
        )
        # msg.attach_alternative(content, 'text/html')
        msg.content_subtype = 'html'
        msg.send()
        return True
    except smtplib.SMTPException :
        return False




def jwtEncode(payload, age, secret):
    """
    Jwt encoding with secret
    """
    payload["exp"] = datetime.datetime.now() + datetime.timedelta(minutes=age)
    token = jwt.encode(payload, key=secret, algorithm="HS256")
    return token




class AuthBackend:
    """
    Authentication Class for login and register and reset password
    """
    def __init__(self, user) -> None:
        self.user = user
    
    @staticmethod
    def authenticate(request, **cred):
        user = login(request, **cred)
        if user:
            return AuthBackend(user)
        
    def get_user(self):
        pass
    
    def check_email_verification(self):
        return self.user.verified
    
    def check_otp_setup(self):
        pass
    
    def verify_otp(self):
        pass
    
    def verify_email(self):
        pass
    
    def otp_setup(self):
        pass
    
    def generate_email_verification(self):
        if not self.check_email_verification():
            random_num, hashed = generate_random_hash()
            
            #update db with the hashed code
            self.user.verification_code = hashed
            self.user.save()
            
            #encode the user email in jwt
            payload = {
                "email": self.user.email,
                "from": "Connexion",
                "next": "VerifyEmail"
            }
            verification_email_status = send_verification_email(self.user.email,random_num)
            token = jwtEncode(payload, age=30, secret=temp_token_secret)
            return token, verification_email_status
            
    
    @staticmethod
    def checktoken(token):
        if token:
            return AuthBackend(id)
        





class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        request.user = "Sometheing"
        setattr(request, "user", "Something")
        print(request)
        return (Members.objects.get(id=1), None)
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



# {"values":{"email":"test@test.com", "password":"1234"}}