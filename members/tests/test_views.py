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


class TestMemberEditDelete(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.client = APIClient()

        cls.church = Church.objects.create(
            church_name="Bethel", opening_date=datetime.date.today()
        )
        cls.church2 = Church.objects.create(
            church_name="Power", opening_date=datetime.date.today()
        )
        cls.city = City.objects.create(city_name="Abidjan")

        cls.role = Role.objects.create(role_name="admin")

        cls.superadmin = Member.objects.create_superuser(
            email="johnashimedua@chms.com",
            password=make_password("1234"),
            first_name="John",
            last_name="Ashimedua",
            device_id=str(uuid4()),
            church=cls.church,
        )

        cls.superadmin2 = Member.objects.create_superuser(
            email="superadmin@chms.com",
            password=make_password("1234"),
            first_name="Second",
            last_name="Superadmin",
            device_id=str(uuid4()),
            church=cls.church,
        )

        # ordinary admins
        cls.admin = Member.objects.create_user(
            email="admin@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test",
            last_name="User",
            device_id=str(uuid4()),
            church=cls.church,
            role=cls.role,
        )
        cls.admin2 = Member.objects.create_user(
            email="second@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test",
            last_name="User",
            device_id=str(uuid4()),
            church=cls.church,
            role=cls.role,
        )

        cls.admin3 = Member.objects.create_user(
            email="thired@chms.com",
            password=make_password("test"),
            is_admin=True,
            first_name="Test4",
            last_name="TEe",
            device_id=str(uuid4()),
            church=cls.church2,
            role=cls.role,
        )

        cls.member = Member.objects.create(
            email="admin2@chms.com",
            first_name="Test2",
            last_name="User2",
            church=cls.church,
        )
        cls.member2 = Member.objects.create(
            email="admina2@chms.com",
            first_name="Test2",
            last_name="User2",
            church=cls.church2,
        )
        return super().setUpTestData()

    def test_superadmin_and_superuser_profile(self):

        # can edit his profile
        url = reverse("member-rud", kwargs={"pk": self.superadmin2.pk})
        payload_superadmin2 = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload_superadmin2, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "Test@email.com",
            "gender": "F",
            "marital_status": "C",
            "category": "Adulte",
            "status": "Ministre",
            "church": self.church.pk,
            "city": self.city.pk,
        }
        res = self.client.put(
            url,
            data=data,
            format="json",
        )

        self.assertEqual(res.status_code, 200)

        # can't edit other superadmin profile except if it's the first superadmin
        data["email"] = "another@email.com"
        data["first_name"] = "J"
        url = reverse("member-rud", kwargs={"pk": self.superadmin.pk})
        res = self.client.put(url, data=data, format="json")
        self.assertEqual(res.status_code, 403)

    def test_superadmin_and_non_superadmin_profile(self):

        # superadmin can edit any non_superadmin profile
        url = reverse("member-rud", kwargs={"pk": self.admin.pk})
        payload_superadmin2 = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload_superadmin2, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        data = {
            "first_name": "Test2",
            "last_name": "User2",
            "email": "Test3@email.com",
            "gender": "F",
            "marital_status": "C",
            "category": "Adulte",
            "status": "Ministre",
            "church": self.church.pk,
            "city": self.city.pk,
        }
        res = self.client.put(
            url,
            data=data,
            format="json",
        )

        self.assertEqual(res.status_code, 200)

    def test_admin_and_other_admin_profile(self):
        # we give him the permissions
        required_perm1 = Permission.objects.get(codename="voir_membre")
        required_perm2 = Permission.objects.get(codename="modifier_membre")
        self.role.permission.add(required_perm1, required_perm2)
        self.role.save()

        # admin can't edit any admin profile including his profile

        # his profile
        url = reverse("member-rud", kwargs={"pk": self.admin.pk})
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        data = {
            "first_name": "Tesft2",
            "last_name": "Usefsr2",
            "email": "Test3@efmail.com",
            "gender": "F",
            "marital_status": "C",
            "category": "Adulte",
            "status": "Ministre",
            "church": self.church.pk,
            "city": self.city.pk,
        }
        res = self.client.put(
            url,
            data=data,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

        # other admin profile
        data["first_name"] = "something"
        data["email"] = "em@em.com"
        data["last_name"] = "something"

        url = reverse("member-rud", kwargs={"pk": self.admin2.pk})
        res = self.client.put(
            url,
            data=data,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

        url = reverse("member-rud", kwargs={"pk": self.admin3.pk})
        res = self.client.put(
            url,
            data=data,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_admin_and_other_non_admin_profile(self):
        # we give him the permissions
        required_perm1 = Permission.objects.get(codename="voir_membre")
        required_perm2 = Permission.objects.get(codename="modifier_membre")
        self.role.permission.add(required_perm1, required_perm2)
        self.role.save()

        # has perms to edit his only church members
        url = reverse("member-rud", kwargs={"pk": self.member.pk})
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        data = {
            "first_name": "Tefsft2",
            "last_name": "Usefasr2",
            "email": "Tesat3@efmail.com",
            "gender": "F",
            "marital_status": "C",
            "category": "Adulte",
            "status": "Ministre",
            "church": self.member.church_id,
            "city": self.city.pk,
        }
        res = self.client.put(
            url,
            data=data,
            format="json",
        )
        self.assertEqual(res.status_code, 200)

        # member of another church
        data["first_name"] = "somethinfg"
        data["email"] = "em@em.comf"
        data["last_name"] = "somethiang"

        url = reverse("member-rud", kwargs={"pk": self.member2.pk})
        res = self.client.put(
            url,
            data=data,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_admin_delete_other_non_admin_toggle_active_inactive(self):
        # we give him the permissions
        required_perm1 = Permission.objects.get(codename="voir_membre")
        required_perm2 = Permission.objects.get(codename="modifier_membre")
        self.role.permission.add(required_perm1, required_perm2)
        self.role.save()

        # has perms to edit his only church members
        url = reverse("member-rud", kwargs={"pk": self.member.pk})
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.patch(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        member = Member.objects.get(id=self.member.pk)
        self.assertEqual(member.is_active, False)

        res = self.client.patch(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        member = Member.objects.get(id=self.member.pk)
        self.assertEqual(member.is_active, True)

        # member of another church
        url = reverse("member-rud", kwargs={"pk": self.member2.pk})
        res = self.client.patch(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_superuser_delete_superuser(self):
        # first superadmin cannot delete their account
        superadmin, created = Member.objects.get_or_create(
            id=1,
            defaults={
                "first_name": "Superuser",
                "last_name": "Superuser",
                "church": self.church,
                "email": "super@email.com",
                "is_superuser": True,
                "is_admin": True,
            },
        )
        url = reverse("member-rud", kwargs={"pk": superadmin.pk})
        payload = {
            "id": superadmin.pk,
            "username": superadmin.first_name,
            "church_id": superadmin.church_id,
            "device_id": superadmin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

        # superadmin cannot delete any other superadmin account
        url = reverse("member-rud", kwargs={"pk": self.superadmin.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 403)

        # superadmin can delete any non superadmin account
        url = reverse("member-rud", kwargs={"pk": self.admin.pk})
        payload = {
            "id": self.superadmin2.pk,
            "username": self.superadmin2.first_name,
            "church_id": self.superadmin2.church_id,
            "device_id": self.superadmin2.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 204)

        # first superadmin can delete any other superadmin account
        superadmin, created = Member.objects.get_or_create(
            id=1,
            defaults={
                "first_name": "Superuser",
                "last_name": "Superuser",
                "church": self.church,
                "email": "super@email.com",
                "is_superuser": True,
                "is_admin": True,
            },
        )
        url = reverse("member-rud", kwargs={"pk": self.superadmin2.pk})
        payload = {
            "id": superadmin.pk,
            "username": superadmin.first_name,
            "church_id": superadmin.church_id,
            "device_id": superadmin.device_id,
        }
        access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 204)

        # admin can't delete admin account or delete members account
        required_perm1 = Permission.objects.get(codename="voir_membre")
        required_perm2 = Permission.objects.get(codename="modifier_membre")
        self.role.permission.add(required_perm1, required_perm2)
        self.role.save()

        url = reverse("member-rud", kwargs={"pk": self.admin2.pk})
        payload_admin = {
            "id": self.admin.pk,
            "username": self.admin.first_name,
            "church_id": self.admin.church_id,
            "device_id": self.admin.device_id,
        }
        access = jwtEncode(payload_admin, age=60, secret=getenv("ACCESS_TOKEN"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 401)

        # member account
        url = reverse("member-rud", kwargs={"pk": self.member2.pk})
        res = self.client.delete(
            url,
            format="json",
        )
        self.assertEqual(res.status_code, 401)
