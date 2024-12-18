from ..models import Account, Transaction_Rule, Category
from members.models import Member
from church.models import Church
from django.contrib.auth.hashers import make_password
from rest_framework.test import APITestCase, APIClient
from uuid import uuid4
from django.urls import reverse
from auth_custom.utils import generate_tokens, jwtEncode
from os import getenv
import datetime


class TestAccounts(APITestCase):

    @classmethod
    def setUpTestData(cls) -> None:
        cls.client = APIClient()
        cls.church = Church.objects.create(
            church_name="Test1", opening_date=datetime.date.today()
        )
        cls.church2 = Church.objects.create(
            church_name="Test2", opening_date=datetime.date.today()
        )
        cls.superadmin = Member.objects.create_superuser(
            email="sj@chms.com",
            first_name="ujser",
            last_name="usejr",
            device_id=str(uuid4()),
            church=cls.church,
        )
        payload = {
            "id": cls.superadmin.pk,
            "username": cls.superadmin.first_name,
            "church_id": cls.superadmin.church_id,
            "device_id": cls.superadmin.device_id,
        }

        cls.account = Account.objects.create(
            account_name="acc1",
            account_type="Caisse",
            balance="78000",
            church_id=cls.church.pk,
            is_main=True,
        )
        cls.account = Account.objects.create(
            account_name="b_acc1",
            account_type="Bancaire",
            balance="50000",
            church_id=cls.church.pk,
            is_main=True,
        )
        cls.access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))
        return super().setUpTestData()

    def test_account_input(self):
        url = reverse("account-create-list")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        data = {
            "account_name": "acc2",
            "account_type": "Caisse",
            "balance": "45000",
            "church": self.church.pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.is_main, False)
        self.assertEqual(acc.balance, data["balance"])

    def test_account_input2(self):
        url = reverse("account-create-list")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        data = {
            "account_name": "acc3",
            "account_type": "Caisse",
            "balance": "45000",
            "church": self.church2.pk,
        }
        data2 = {
            "account_name": "acc4",
            "account_type": "Caisse",
            "balance": "14000",
            "church": self.church2.pk,
        }
        res = self.client.post(url, data=data, format="json")
        res2 = self.client.post(url, data=data2, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res2.status_code, 201)

        acc = Account.objects.get(id=res.data["id"])
        acc2 = Account.objects.get(id=res2.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc2.balance, data2["balance"])
        self.assertEqual(acc.is_main, True)
        self.assertEqual(acc2.is_main, False)

    def test_cash_bank_account(self):
        url = reverse("account-create-list")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        data = {
            "account_name": "b_acc1",
            "account_type": "Bancaire",
            "balance": "45000",
            "church": self.church.pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc.is_main, False)

        data = {
            "account_name": "b_acc25",
            "account_type": "Caisse",
            "balance": "14000",
            "church": self.church2.pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc.is_main, True)

        data = {
            "account_name": "b_ac5",
            "account_type": "Bancaire",
            "balance": "4500",
            "church": self.church2.pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc.is_main, True)

        data = {
            "account_name": "b_acc25",
            "account_type": "Caisse",
            "balance": "7400",
            "church": self.church2.pk,
        }

        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc.is_main, False)

        data = {
            "account_name": "b_c5",
            "account_type": "Bancaire",
            "balance": "14800",
            "church": self.church2.pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
        acc = Account.objects.get(id=res.data["id"])
        self.assertEqual(acc.balance, data["balance"])
        self.assertEqual(acc.is_main, False)
