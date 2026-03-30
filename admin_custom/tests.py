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


class TestAdminSuperAdminRoles(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.client = APIClient()

        cls.church = Church.objects.create(
            church_name="Kingdom", opening_date=datetime.date.today()
        )

        cls.role = Role.objects.create(role_name="admin")
        cls.role2 = Role.objects.create(role_name="secondrole")

        cls.superadmin, created = Member.objects.get_or_create(
            id=1,
            defaults={
                "email": "johnashimedua2@chms.com",
                "password": make_password("1234"),
                "first_name": "Johnn",
                "last_name": "Ashimedua",
                "device_id": str(uuid4()),
                "is_admin": True,
                "is_superuser": True,
                "is_staff": True,
                "church": cls.church,
            },
        )

        cls.superadmin2 = Member.objects.create_superuser(
            email="superadmin2f@chms.com",
            password=make_password("1234"),
            first_name="Second",
            last_name="Superadmin",
            device_id=str(uuid4()),
            church=cls.church,
        )

        # ordinary admins
        cls.admin = Member.objects.create_user(
            email="adfmin@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Tesfft",
            last_name="User",
            device_id=str(uuid4()),
            church=cls.church,
            role=cls.role,
        )

        #  members
        cls.member = Member.objects.create(
            email="adfamin@chms.com",
            first_name="Taaest",
            last_name="Usfer",
            church=cls.church,
            role=cls.role,
        )

        cls.member2 = Member.objects.create(
            email="admin2@chms.com",
            first_name="Test2",
            last_name="User2",
            church=cls.church,
        )

        return super().setUpTestData()

    def test_superadmin_add_admin(self):
        url = reverse("add-remove-admin", kwargs={"pk": self.member.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.member.pk)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(member.is_admin, True)

    def test_superadmin_remove_admin(self):
        url = reverse("add-remove-admin", kwargs={"pk": self.admin.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.member.pk)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(member.is_admin, False)
        self.assertEqual(member.is_superuser, False)

    def test_admin_cannot_add_admin(self):
        url = reverse("add-remove-admin", kwargs={"pk": self.member.pk})
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.member.pk)

        self.assertEqual(res.status_code, 401)
        self.assertEqual(member.is_admin, False)

    def test_superuser_cannot_add_superuser(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.admin.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.admin.pk)

        self.assertEqual(res.status_code, 400)
        self.assertEqual(member.is_superuser, False)

    def test_superuser_cannot_remove_superuser(self):
        su = Member.objects.create_superuser(
            first_name="fj", last_name="dk", password="dk", email="d@e.com"
        )
        url = reverse("add-remove-superadmin", kwargs={"pk": su.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.admin.pk)

        self.assertEqual(res.status_code, 400)
        self.assertEqual(member.is_superuser, False)

    def test_first_superuser_can_add_superuser(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.admin.pk})
        payload = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": self.superadmin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.admin.pk)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(member.is_admin, True)
        self.assertEqual(member.is_superuser, True)

    def test_first_superuser_remove_superuser(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.superadmin2.pk})
        payload = {
            "id": self.superadmin.pk,
            "username": self.superadmin.first_name,
            "church_id": self.superadmin.church_id,
            "device_id": self.superadmin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.admin.pk)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(member.is_admin, True)
        self.assertEqual(member.is_superuser, False)

    def test_superuser_cannot_remove_his_profile_superuser(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.superadmin2.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.superadmin2.pk)

        self.assertEqual(res.status_code, 400)
        self.assertEqual(member.is_admin, True)
        self.assertEqual(member.is_superuser, True)

    def test_admin_cannot_remove_his_profile_admin(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.admin.pk})
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.admin.pk)

        self.assertEqual(res.status_code, 401)
        self.assertEqual(member.is_admin, True)
        self.assertEqual(member.is_superuser, False)

    def test_non_admin_cannot_access_addadmin(self):
        url = reverse("add-remove-admin", kwargs={"pk": self.member2.pk})
        payload = {
            "id": self.member.pk,
            "username": self.member.first_name,
            "church_id": self.member.church_id,
            "device_id": self.member.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.member2.pk)

        self.assertEqual(res.status_code, 401)
        self.assertEqual(member.is_admin, False)
        self.assertEqual(member.is_superuser, False)

    def test_non_admin_cannot_access_addsuperadmin(self):
        url = reverse("add-remove-superadmin", kwargs={"pk": self.member2.pk})
        payload = {
            "id": self.member.pk,
            "username": self.member.first_name,
            "church_id": self.member.church_id,
            "device_id": self.member.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        member = Member.objects.get(id=self.member2.pk)

        self.assertEqual(res.status_code, 401)
        self.assertEqual(member.is_admin, False)
        self.assertEqual(member.is_superuser, False)

    def test_admin_perms(self):
        # add perms to admin account
        perm1 = Permission.objects.get(codename="voir_membre")
        perm2 = Permission.objects.get(codename="modifier_membre")
        self.role.permission.add(perm1, perm2)
        self.role.save()

        url = reverse("admin-permissions")
        payload = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.get(
            url,
            format="json",
        )

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["permissions"]["superAdmin"], self.admin.is_superuser)
        self.assertEqual(isinstance(res.data["permissions"]["perms"], list), True)
        self.assertIn("voir_membre", res.data["permissions"]["perms"])
        self.assertIn("modifier_membre", res.data["permissions"]["perms"])
        self.assertEqual(len(res.data["permissions"]["perms"]), 2)
