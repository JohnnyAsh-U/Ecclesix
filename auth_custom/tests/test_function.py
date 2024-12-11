from django.test import TestCase, SimpleTestCase
from .. import utils, auth
from members.models import Member
from django.core import mail
from uuid import uuid4
from os import getenv
import pyotp
from rest_framework import exceptions


class TestFunc(SimpleTestCase):
        
    def test_email_code_generator(self):
        self.code = utils.generate_random_hash()
        self.assertIsInstance(self.code, tuple)
        self.assertTrue(len(self.code), 2)
        self.assertTrue(len(self.code[0]), 6)
        
    def test_compare_hash(self):
        self.code = utils.generate_random_hash()
        function_works = utils.compare_hash(self.code[0], self.code[1])
        self.assertEqual(function_works, True)
        
        
    def test_jwt_function(self):
        payload = {"email":"johnashimedua@chms.com"}
        expired_code = utils.jwtEncode(payload, age=-1, secret="john")
        decoded_expired_code = utils.jwtDecode(expired_code, secret="john")
        self.assertEqual(decoded_expired_code, None)
    
        valid_token = utils.jwtEncode(payload, age=1, secret="john")
        decoded_code_wrong_secret = utils.jwtDecode(valid_token, secret="johna")
        self.assertEqual(decoded_code_wrong_secret, None)
        
        decoded: dict = utils.jwtDecode(valid_token, secret="john")
        self.assertIsInstance(decoded, dict)
        self.assertTrue(decoded.keys(), ['email', 'exp'])
        email = decoded.get('email')
        self.assertEqual('johnashimedua@chms.com', email)
        
        
    def test_access_refresh_token(self):
        payload = {"email":"johnashimedua@chms.com"}
        self.token = utils.generate_tokens(payload)
        self.assertIsInstance(self.token, tuple)
        self.assertEqual(len(self.token), 2)
        
        #access token
        wrong_decode_access = utils.jwtDecode(self.token[0], getenv('REFRESH_TOKEN'))
        self.assertEqual(wrong_decode_access, None)
        decoded = utils.jwtDecode(self.token[0], getenv('ACCESS_TOKEN'))
        self.assertIsInstance(decoded, dict)
        self.assertTrue(decoded.keys(), ['email', 'exp'])
        email = decoded.get('email')
        self.assertEqual('johnashimedua@chms.com', email)
        
        #refresh token
        wrong_decode_refresh = utils.jwtDecode(self.token[1], getenv('ACCESS_TOKEN'))
        self.assertEqual(wrong_decode_refresh, None)
        decoded = utils.jwtDecode(self.token[1], getenv('REFRESH_TOKEN'))
        self.assertIsInstance(decoded, dict)
        self.assertTrue(decoded.keys(), ['email', 'exp'])
        email = decoded.get('email')
        self.assertEqual('johnashimedua@chms.com', email)
      
        
        
class TestAuthBackend(TestCase):
    def setUp(self):
        Member.objects.create_superuser(
            email="johnashimedua@chms.com",
            password= "1234",
            first_name = "John",
            last_name = "Ashimedua"
        )
        self.login_user = auth.AuthBackend.authenticate(request=None, email="johnashimedua@chms.com", password="1234")
        
    def test_wrong_auth_login(self):
        wrong_cred = auth.AuthBackend.authenticate(request= None, email="johnashimedua@chms.com", password = "45221")
        self.assertEqual(wrong_cred, None)
        
        
    def test_auth_instance(self):
        self.assertIsInstance(self.login_user, auth.AuthBackend)
        self.assertIsInstance(self.login_user.user, Member)
        self.assertEqual(self.login_user.check_otp(), False)    
        self.assertEqual(self.login_user.check_email_verification(), False)
        
    def test_verify_email(self):
        #generate email code 
        generate_email_verification = self.login_user.generate_email_verification()
        self.assertIsInstance(generate_email_verification, tuple)
        self.assertEqual(len(generate_email_verification), 3)
        token, sent, code = generate_email_verification
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(sent, True)
        
        #verifying email with code
        wrong_email_code = auth.AuthBackend.verify_email(token, "145256")
        self.assertNotIsInstance(wrong_email_code, Member)
        correct_email_code = auth.AuthBackend.verify_email(token, code)
        self.assertIsInstance(correct_email_code, Member)
        self.assertEqual(correct_email_code.verified, True)
        
    def test_refresh_token_device_id(self):
        device_id = str(uuid4())
        self.login_user.user.device_id = device_id
        self.login_user.user.save()
        
        token_different_device_id = utils.jwtEncode({"id":self.login_user.user.pk, "device_id": device_id + "1"}, age=10, secret="secret")
        test_refresh = self.login_user.verify_refresh_token(token_different_device_id, "secret")
        self.assertNotEqual(test_refresh, True)
        
        token_different_id = utils.jwtEncode({"id":2, "device_id": device_id }, age=10, secret="secret")
        test_refresh = self.login_user.verify_refresh_token(token_different_id, "secret")
        self.assertNotEqual(test_refresh, True)
        
        token_wrong_payload = utils.jwtEncode({"id":2, "device_id": device_id  + '4' }, age=10, secret="secret")
        test_refresh = self.login_user.verify_refresh_token(token_wrong_payload, "secret")
        self.assertNotEqual(test_refresh, True)
        
        expired_token = utils.jwtEncode({"id":1, "device_id": device_id }, age=-1, secret="secret")
        test_refresh = self.login_user.verify_refresh_token(expired_token, "secret")
        self.assertNotEqual(test_refresh, True)
        
        
        token = utils.jwtEncode({"id":self.login_user.user.pk, "device_id": device_id}, age=10, secret="secret")
        test_refresh = self.login_user.verify_refresh_token(token, "secret")
        self.assertEqual(test_refresh, True)
        
        
    def test_otp_verify(self):
        otp_key = pyotp.random_base32()
        otp_code = pyotp.TOTP(otp_key).now()
        
        #expired token
        expired_token = utils.jwtEncode({"email": self.login_user.user.email}, age=-1, secret=getenv('TEMP_TOKEN'))
        with self.assertRaises(exceptions.AuthenticationFailed):
            auth.AuthBackend.verify_otp(expired_token,otp_code=otp_code, secret=otp_key)
        
        #incorrect signing secret   
        incorrect_token = utils.jwtEncode({"email": self.login_user.user.email}, age=10, secret='secret')
        with self.assertRaises(exceptions.AuthenticationFailed):
            auth.AuthBackend.verify_otp(incorrect_token, otp_code, secret=otp_key)
            
        #wrong email
        wrong_email = utils.jwtEncode({"email": "text@test.com"}, age=10, secret=getenv('TEMP_TOKEN'))
        with self.assertRaises(exceptions.AuthenticationFailed):
            auth.AuthBackend.verify_otp(wrong_email, otp_code, secret=otp_key)
            
        #wrong otp code
        token = utils.jwtEncode({"email": self.login_user.user.email}, age=10, secret=getenv('TEMP_TOKEN'))
        is_valid = auth.AuthBackend.verify_otp(token, otp_code=otp_code+"1", secret=otp_key)
        self.assertEqual(is_valid, False)
        
        #correct otp code
        token = utils.jwtEncode({"email": self.login_user.user.email}, age=10, secret=getenv('TEMP_TOKEN'))
        is_valid = auth.AuthBackend.verify_otp(token, otp_code=otp_code, secret=otp_key)
        self.assertNotEqual(is_valid, False)
        self.assertIsInstance(is_valid[0], Member)
            
            
        #user has an otpkey in db
        user = Member.objects.get(email = "johnashimedua@chms.com")
        user.otp_key = otp_key
        user.save()
        
        #generate new key and code
        new_otp_key = pyotp.random_base32()
        new_otp_code = pyotp.TOTP(new_otp_key)
        
        #to make sure priority is given to the key in the db
        token = utils.jwtEncode({"email": self.login_user.user.email}, age=10, secret=getenv('TEMP_TOKEN'))
        is_valid = auth.AuthBackend.verify_otp(token, otp_code=new_otp_code, secret=new_otp_key)
        self.assertEqual(is_valid, False)
        
        #correct verification code using db otp key
        token = utils.jwtEncode({"email": self.login_user.user.email}, age=10, secret=getenv('TEMP_TOKEN'))
        is_valid = auth.AuthBackend.verify_otp(token, otp_code=otp_code)
        self.assertNotEqual(is_valid, False)
        self.assertIsInstance(is_valid[0], Member)
        
        
    def test_sent_reset_password_email(self):
         #generate email code 
        generate_email = self.login_user.send_reset_password_email()
        self.assertEqual(generate_email, True)
        self.assertEqual(len(mail.outbox), 1)
        
        

        
        
        
        
            
        
       
        
        
        