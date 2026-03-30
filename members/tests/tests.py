from rest_framework.test import APIClient, APITestCase
from church.models import Church, Church_type, City
from admin_custom.models import Role
from members.models import Member
from django.contrib.auth.models import Permission
from django.contrib.auth.hashers import make_password
from uuid import uuid4
from django.urls import reverse
from auth_custom.utils import generate_tokens, jwtEncode
from os import getenv
import datetime

class TestMemberRUD(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.client = APIClient()
        
        cls.church = Church.objects.create(
            church_name="Bethel", opening_date=datetime.date.today()
        )
        cls.church2 = Church.objects.create(
            church_name="Power", opening_date=datetime.date.today()
        )
        
        cls.role = Role.objects.create(
            role_name = "admin"
        )
        
        cls.superadmin = Member.objects.create_superuser(
            email="johnashimedua@chms.com",
            password=make_password("1234"),
            first_name="John",
            last_name="Ashimedua",
            device_id=str(uuid4()),
            church = cls.church
        )

        # ordinary admins
        cls.admin = Member.objects.create_user(
            email="admin@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test",
            last_name="User",
            device_id = str(uuid4()),
            church = cls.church,
            role = cls.role
        )
        
        cls.admin2 = Member.objects.create(
            email="admin2@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test2",
            last_name="User2",
            device_id = str(uuid4()),
            church = cls.church2,
        )
        return super().setUpTestData()

        
    def test_superadmin_view_his_profile(self):
        
        #view his profile
        url = reverse('member-rud', kwargs={"pk" : self.superadmin.pk})
        payload_superadmin = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": self.superadmin.device_id,
        }
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
    def test_superadmin_view_other_members_profile(self):
        
        #member from his church
        url = reverse('member-rud', kwargs={"pk" : self.admin.pk})
        payload_superadmin = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": self.superadmin.device_id,
        }
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
        #member from other church
        url = reverse('member-rud', kwargs={"pk" : self.admin2.pk})
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
        
    
    
    def test_admin_view_his_profile(self):
        
        #view his profile
        url = reverse('member-rud', kwargs={"pk" : self.admin.pk})
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
    
    
    def test_admin_view_profile_without_perms(self):
        
        #member from his church
        url = reverse('member-rud', kwargs={"pk" : self.superadmin.pk})
        payload_superadmin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload_superadmin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 403)
        
        #member from other church
        url = reverse('member-rud', kwargs={"pk" : self.admin2.pk})
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 403)
        
        
    def test_admin_view_profile_with_member_church_perms(self):
        #test admin with perm to view only his church member and not others
        
        #give him perm
        required_perm = Permission.objects.get(codename = "voir_membre")
        self.role.permission.add(required_perm)
        self.role.save()
        
        #member from his church
        url = reverse('member-rud', kwargs={"pk" : self.superadmin.pk})
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
        #member from other church
        url = reverse('member-rud', kwargs={"pk" : self.admin2.pk})
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 403)
        
        
        
    def test_admin_view_profile_with_all_member_perms(self):
        #test admin with perm to view all member
        
        #give him perm
        required_perm = Permission.objects.get(codename = "voir_touts_membres")
        self.role.permission.add(required_perm)
        self.role.save()
        
        #member from his church
        url = reverse('member-rud', kwargs={"pk" : self.superadmin.pk})
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)
        
        #member from other church
        url = reverse('member-rud', kwargs={"pk" : self.admin2.pk})
        
        res = self.client.get(url,format="json")
        self.assertEqual(res.status_code, 200)