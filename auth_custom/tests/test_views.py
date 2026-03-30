from django.test import TestCase
from rest_framework.test import APIClient, APITestCase, APIRequestFactory
from members.models import Member
from ..utils import generate_tokens, jwtEncode
from django.core import mail
from django.urls import reverse
import uuid
import os


class AuthTest(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.superadmin = Member.objects.create_superuser(
            email="johnashimedua@chms.com",
            password="1234",
            first_name="John",
            last_name="Ashimedua",
        )
        
        #member that was just made an admin
        cls.admin = Member.objects.create(
            email="admin@chms.com",
            is_admin = True,
            first_name="Test",
            last_name="User",
        )
         
        #normal user(member)
        cls.user = Member.objects.create(
            email="testuser@chms.com",
            first_name="Test",
            last_name="User",
        )
        return super().setUpTestData()
    
    
    def test_register(self):
        url = reverse('register')
        values = {"values": {}}

        # no email or password
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        # if member does exist but not an admin
        values["values"]["email"] = "testuser@chms.com"
        values["values"]["password"] = "password"
        values["values"]["password2"] = "password"
        
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)


        # if user is already an admin
        values["values"]["email"] = "johnashimedua@chms.com"
        values["values"]["password"] = "1234"
        values["values"]["password2"] = "1234"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)
        

        # if user is a newly appointed admin
        values["values"]["email"] = "admin@chms.com"
        values["values"]["password"] = "newpass"
        values["values"]["password2"] = "newpass"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(response.data["email"], "admin@chms.com")
        self.assertEqual(response.data["next"], "VerifyEmail")

        
    

    def test_connexion(self):
        url = reverse('login')
        values = {"values": {}}

        # no email or password
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        values["values"]["email"] = "johnashimedua@chms.com"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        del values["values"]["email"]
        values["values"]["password"] = "password"
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        # if member does exist
        values["values"]["email"] = "user2@chms.com"
        values["values"]["password"] = "password"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        # if password is incorrect
        values["values"]["email"] = "johnashimedua@chms.com"
        values["values"]["password"] = "1456"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)

        # if user exist and authenticate but not verified with email
        values["values"]["email"] = "johnashimedua@chms.com"
        values["values"]["password"] = "1234"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(response.data["email"], "johnashimedua@chms.com")
        self.assertEqual(response.data["next"], "VerifyEmail")

        # if user has verified email and no refresh token
        self.superadmin.verified = True
        self.superadmin.save()
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["next"], "OTP")
        self.assertEqual(response.data["user"], "John Ashimedua")
        self.assertEqual(response.data["hasOTP"], False)

        # if user has verified email and setup otp but no refresh token
        self.superadmin.otp_key = "kfie"
        self.superadmin.save()
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["next"], "OTP")
        self.assertEqual(response.data["user"], "John Ashimedua")
        self.assertEqual(response.data["hasOTP"], True)

        # if user has verified email and setup otp and refresh token in cookies
        #and refresh token has the same device id with the db
        device_id = str(uuid.uuid4())
        self.superadmin.device_id = device_id
        self.superadmin.save()
        new_payload = {
            "id": self.superadmin.id,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": device_id,
        }
        access, refresh = generate_tokens(new_payload)
        self.client.cookies['refreshToken'] = refresh
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['next'], "Dashboard")
        self.assertEqual(type(response.data['token']), str)
        
        # if user has verified email and setup otp and refresh token in cookies
        #and refresh token has the different device id from that of db 
        self.client.cookies.clear()
        self.client.cookies['refreshToken'] = refresh
        
        device_id = str(uuid.uuid4())
        self.superadmin.device_id = device_id
        self.superadmin.save()
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['next'], "OTP")
        self.assertEqual(response.data['user'], "John Ashimedua")
        
        
        #test if a newly appointed admin can authenticate with registration
        values["values"]["email"] = "admin@chms.com"
        values["values"]["password"] = "None"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)
        
        
        #test if an  ordinary member can authenticate
        values["values"]["email"] = "testuser@chms.com"
        values["values"]["password"] = "None"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)
        
        
    def test_reinitialization(self):
        url = reverse('reinitialization')
        values = {"values": {}}
        
        #no email
        values["values"]["email"] = ""
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        
        #with invalid email
        values["values"]["email"] = "invalidemail@chms.com"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)
        
        
        #with nonadmin email that has None password
        values["values"]["email"] = "testuser@chms.com"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], False)
        
        
        #with valid email
        values["values"]["email"] = "johnashimedua@chms.com"
        response = self.client.post(url, data=values, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(response.data.keys()), ['email'])
        self.assertEqual(len(mail.outbox), 1)
        
        
    def test_confirm_reset_pass(self):
        
        url = reverse('confirm-reinitialization')
        query = {}
        
        #no token in query
        response = self.client.get(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #invalid token
        query['token'] = 'tokenhere'
        response = self.client.get(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #expired token
        token = jwtEncode({"email": "johnashimedua@chms.com", "id": 1}, age=-1, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.get(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #valid token with invalid user
        token = jwtEncode({"email": "test@test.com", "id": 1}, age=1, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.get(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #valid token with valid user
        token = jwtEncode({"email": self.superadmin.email, "id": self.superadmin.id}, age=10, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.get(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.data, {"email": self.superadmin.email, "name": self.superadmin.get_full_name()})
       
       
    def test_password_reset(self):
        url = reverse('reset-password')
        values = {
           "values": { "password": "pass",
            "password2": "pass"}
        }
        query = {}
        
        #no token in query
        response = self.client.post(url, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #expired token
        token = jwtEncode({"email": "johnashimedua@chms.com", "id": 1}, age=-1, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.post(url, data=values, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #valid token with invalid user
        token = jwtEncode({"email": "test@test.com", "id": 1}, age=2, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.post(url, data=values, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        #valid token, valid user with wrong password match
        values["values"]['password2'] = 'passs'
        token = jwtEncode({"email": self.superadmin.email, "id": self.superadmin.id}, age=10, secret=os.getenv('EMAIL_TOKEN'))
        query['token'] = token
        response = self.client.post(url, data=values, query_params=query, format="json")
        self.assertEqual(response.status_code, 400)
        
        
        #valid token, valid user, valid pass
        values['values']['password2'] = 'pass'
        response = self.client.post(url,data=values, query_params=query, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.keys()), 2)
        self.assertEqual(response.data['next'], "OTP")
       
        
    
        
    
    
    def test_refresh_token_url(self):
        url = reverse('refresh-token')
        device_id = str(uuid.uuid4())
        self.superadmin.device_id = device_id
        self.superadmin.save()
        
        #no refresh token
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, 400)
        
        #there is refresh token
        new_payload = {
            "id": self.superadmin.id,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": device_id,
        }
        
        access, refresh = generate_tokens(new_payload)
        self.client.cookies["refreshToken"] = refresh
        
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(type(response.data['token']), str)
        
        #if the device id is different in the db is different from
        #the one in the token
        device_id = str(uuid.uuid4())
        self.superadmin.device_id = device_id
        self.superadmin.save()
        
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, 401)
        
        
        
        
        
        
        
        
        