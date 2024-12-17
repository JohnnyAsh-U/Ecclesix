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


class TestTransactionRules(APITestCase):

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
            email="s@chms.com",
            first_name="user",
            last_name="user",
            device_id=str(uuid4()),
            church=cls.church,
        )
        payload = {
            "id": cls.superadmin.pk,
            "username": cls.superadmin.first_name,
            "church_id": cls.superadmin.church_id,
            "device_id": cls.superadmin.device_id,
        }
        cls.access = jwtEncode(payload, age=60, secret=getenv("ACCESS_TOKEN"))

        cls.category = Category.objects.create(
            category_name="cate1", category_type="Credit"
        )
        cls.category2 = Category.objects.create(
            category_name="cate2", category_type="Credit"
        )
        accounts = ["Main", "Acc1", "Acc2", "Acc3"]
        cls.accounts = []
        for acc in accounts:
            obj = Account.objects.create(
                account_name=acc,
                account_type="Caisse",
                amount=0.00,
                is_main=True if acc == "Main" else False,
                church=cls.church,
            )
            cls.accounts.append(obj)
        return super().setUpTestData()

    def test_valid_rule_input(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        url = reverse("rule-create-list")
        data = {
            "rule_name": "rule1",
            "percentage": "25",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[0].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule2",
            "percentage": "50",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[1].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule3",
            "percentage": "25",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[2].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

    def test_valid_rule_edit(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        rule1 = Transaction_Rule.objects.create(
            rule_name="rule1",
            percentage=25.00,
            category=self.category,
            church=self.church,
            account=self.accounts[0],
        )
        rule2 = Transaction_Rule.objects.create(
            rule_name="rule2",
            percentage=50.00,
            category=self.category,
            church=self.church,
            account=self.accounts[1],
        )
        rule3 = Transaction_Rule.objects.create(
            rule_name="rule3",
            percentage=25.00,
            category=self.category,
            church=self.church,
            account=self.accounts[2],
        )
        url = reverse("rule-rud", kwargs={"pk": rule1.pk})

        data = {"percentage": "15"}

        res = self.client.patch(url, data=data, format="json")
        self.assertEqual(res.status_code, 200)

        url = reverse("rule-rud", kwargs={"pk": rule3.pk})

        data = {"percentage": "35"}

        res = self.client.patch(url, data=data, format="json")
        self.assertEqual(res.status_code, 200)
        rule1.refresh_from_db()
        rule2.refresh_from_db()
        rule3.refresh_from_db()
        self.assertEqual(rule1.percentage, 15.00)
        self.assertEqual(rule3.percentage, 35.00)
        self.assertEqual(rule2.percentage, 50.00)

    def test_invalid_rule_input(self):
        """To test when the percentage of same category of same church
        Exceeds the 100% limit
        """
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        url = reverse("rule-create-list")
        data = {
            "rule_name": "rule1",
            "percentage": "26",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[0].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule2",
            "percentage": "50",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[1].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule3",
            "percentage": "25",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[2].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 400)
        
    def test_invalid_rule_input(self):
        """To test when the percentage exceeds the 100% limit
        """
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        url = reverse("rule-create-list")
        data = {
            "rule_name": "rule1",
            "percentage": "100.1",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[0].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 400)

    def test_invalid_rule_edit(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        rule1 = Transaction_Rule.objects.create(
            rule_name="rule1",
            percentage=25.00,
            category=self.category,
            church=self.church,
            account=self.accounts[0],
        )
        rule2 = Transaction_Rule.objects.create(
            rule_name="rule2",
            percentage=50.00,
            category=self.category,
            church=self.church,
            account=self.accounts[1],
        )
        rule3 = Transaction_Rule.objects.create(
            rule_name="rule3",
            percentage=25.00,
            category=self.category,
            church=self.church,
            account=self.accounts[2],
        )
        url = reverse("rule-rud", kwargs={"pk": rule1.pk})

        data = {"percentage": "26"}

        res = self.client.patch(url, data=data, format="json")
        self.assertEqual(res.status_code, 400)

        url = reverse("rule-rud", kwargs={"pk": rule2.pk})

        data = {"percentage": "50.1"}

        res = self.client.patch(url, data=data, format="json")
        self.assertEqual(res.status_code, 400)

        rule1.refresh_from_db()
        rule2.refresh_from_db()
        rule3.refresh_from_db()
        self.assertEqual(rule1.percentage, 25.00)
        self.assertEqual(rule2.percentage, 50.00)
        self.assertEqual(rule3.percentage, 25.00)

    def test_valid_rule_input2(self):
        """To test when the percentage of same category of but different church"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        url = reverse("rule-create-list")
        data = {
            "rule_name": "rule1",
            "percentage": "26",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[0].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule2",
            "percentage": "50",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[1].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule3",
            "percentage": "25",
            "category": self.category.pk,
            "church": self.church2.pk,
            "account": self.accounts[2].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

    def test_valid_rule_input3(self):
        """To test when the percentage of different category of same church"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        url = reverse("rule-create-list")
        data = {
            "rule_name": "rule1",
            "percentage": "26",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[0].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule2",
            "percentage": "50",
            "category": self.category.pk,
            "church": self.church.pk,
            "account": self.accounts[1].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)

        data = {
            "rule_name": "rule3",
            "percentage": "25",
            "category": self.category2.pk,
            "church": self.church.pk,
            "account": self.accounts[2].pk,
        }
        res = self.client.post(url, data=data, format="json")
        self.assertEqual(res.status_code, 201)
