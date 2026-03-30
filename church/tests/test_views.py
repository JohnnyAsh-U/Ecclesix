from rest_framework.test import APIClient, APITestCase
from ..models import Church, Church_type, City
from admin_custom.models import Role
from members.models import Member
from django.contrib.auth.models import Permission
from django.contrib.auth.hashers import make_password
from uuid import uuid4
from django.urls import reverse
from auth_custom.utils import generate_tokens, jwtEncode
from os import getenv
import datetime

# Member.objects.create_superuser


class TestChurchAppViews(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.client = APIClient()

        cls.device_id = str(uuid4())

        cls.superadmin = Member.objects.create_superuser(
            email="johnashimedua@chms.com",
            password=make_password("1234"),
            first_name="John",
            last_name="Ashimedua",
            device_id=cls.device_id,
        )
        

        # cls.type = Church_type.objects.create()

        cls.church = Church.objects.create(
            church_name="Bethel", opening_date=datetime.date.today()
        )

        # ordinary admin
        cls.admin = Member.objects.create_user(
            email="admin@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test",
            last_name="User",
            device_id = cls.device_id
        )

        # normal user(member)
        cls.user = Member.objects.create_user(
            email="testuser@chms.com",
            password="None",
            first_name="Test",
            last_name="User",
        )
        
        cls.role = Role.objects.create(
            role_name = "admin"
        )
        
        return super().setUpTestData()

    def test_jwt_backend(self):
        url = reverse("city")

        # no access or refresh token
        res = self.client.get(url)
        self.assertEqual(res.status_code, 401)

        # with wrong jwt token
        payload = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        }

        access = jwtEncode(payload, age=60, secret="disksi")
        res = self.client.get(url)
        self.assertEqual(res.status_code, 401)

        # with right but expired token
        access = jwtEncode(payload, age=-1, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.get(url)
        self.assertEqual(res.status_code, 401)
        
        #with right but non existent user
        payload['id'] = 5
        access = jwtEncode(payload, age=-1, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.get(url)
        self.assertEqual(res.status_code, 401)
        
        # with right token an right user
        payload['id'] = self.superadmin.pk
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        
    def test_city_crud(self):
        #no perms for get req
        url = reverse("city")
        
        #with ordinary admin that has no perm 
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        } 
        payload_superadmin = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        }
        
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        
        
        #for creating new city, only superadmin can create superadmin
        res = self.client.post(url, data={"city_name": "Abidjan"}, format="json")
        self.assertEqual(res.status_code, 403)
        

        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data={"city_name": "Abidjan"}, format="json")
        self.assertEqual(res.status_code, 201)
        
        
        #for modifying city, only superadmin
        url = reverse('city-rud', kwargs={"pk" : res.data['id'] })
        
        #admin
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data={"city_name": "Yakro"}, format="json")
        self.assertEqual(res.status_code, 403)
        
        #superadmin
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.put(url, data={"city_name": "Yakro"}, format="json")
        self.assertEqual(res.status_code, 200)
        
        
        #for deleting city, only superadmin
        url = reverse('city-rud', kwargs={"pk" : res.data['id']})
        
        #admin
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 403)
        
        #superadmin
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 204)
        

    def test_church_type_crud(self):
        #no perms for get req
        url = reverse("type")
        
        #with ordinary admin that has no perm 
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        } 
        payload_superadmin = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        }
        
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        
        
        #for creating new type, only superadmin can create type
        res = self.client.post(url, data={"church_type_name": "HQ", "description": "HQ church"}, format="json")
        self.assertEqual(res.status_code, 403)
        

        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data={"church_type_name": "HQ", "description": "HQ church"}, format="json")
        self.assertEqual(res.status_code, 201)
        
        
        
        #for modifying type, only superadmin
        url = reverse('type-rud', kwargs={"pk" : res.data['id']})
        
        #admin
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data={"church_type_name": "HQ Modified", "description": "HQ church"}, format="json")
        self.assertEqual(res.status_code, 403)
        
        #superadmin
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.put(url, data={"church_type_name": "HQ Modified", "description": "HQ church modified"}, format="json")
        self.assertEqual(res.status_code, 200)
        
        
        #for deleting city, only superadmin
        url = reverse('type-rud', kwargs={"pk" : res.data['id']})
        
        #admin
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 403)
        
        #superadmin
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 204)
        
        
    def test_church(self):
         #no perms for get req
        url = reverse("church")
        
        #with ordinary admin that has no perm 
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        } 
        payload_superadmin = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.church.pk,
            "device_id": self.device_id,
        }
        
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        
        #superadmin payload
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        #to create city
        city_res = self.client.post(reverse('city'), data={"city_name": "Abidjan"}, format="json")
        self.assertEqual(city_res.status_code, 201)
        
        #to create type
        church_type_res = self.client.post(reverse("type"), data={"church_type_name": "HQ", "description": "HQ church"}, format="json")
        self.assertEqual(church_type_res.status_code, 201)
        
        data = {
            "church_name": "GKPM",
            "address": "Abidjan Cocody",
            "opening_date" : "2022-02-23",
            "city": city_res.data['id'],
            "type": church_type_res.data['id'],
            "leader": self.superadmin.pk,
            "leader2": self.admin.pk
        }
        #for admin creating new church: error, only superadmin can create church
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 403)
        

        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        
        
        
        #for modifying church, only superadmin or admin with "modifier_eglise" perm
        url = reverse('church-rud', kwargs={"pk" : res.data['id']})
        
        data['church_name'] = "Modified"
        data['address'] = "Another Address"
        data["leader"] = self.admin.pk
        data["leader2"] = self.superadmin.pk
        
        #admin without the required perm
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 403)
        
        
        # add the required perm to a role and assign the role to the admin-user
        required_perm = Permission.objects.get(codename = "modifier_eglise")
        self.role.permission.add(required_perm)
        self.admin.role = self.role
        self.admin.save()
        
        #try again
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.put(url, data=data, format="json")
        self.assertEqual(res.status_code, 200)
        
        #superadmin can modifier church
        data['church_name'] = "Modified again"
        data['address'] = "Another Address again"
        data["leader"] = self.superadmin.pk
        data["leader2"] = self.admin.pk
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.put(url, data=data, format="json")
        self.assertEqual(res.status_code, 200)
        
        
        #for deleting city, only superadmin
        url = reverse('church-rud', kwargs={"pk" : res.data['id']})
        
        #admin
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 403)
        
        #superadmin
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.delete(url, format="json")
        self.assertEqual(res.status_code, 204)
        
        
