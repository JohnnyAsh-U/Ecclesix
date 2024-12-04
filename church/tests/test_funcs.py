from django.test import TestCase, Client
from rest_framework.test import APITestCase
from church.models import Church, City, Church_type
from event.models import Event, Event_Type
from members.models import Member
from random import randint
from datetime import date
from church import services
from backend.utils import time_date
from dateutil.relativedelta import relativedelta


class Test_Members(APITestCase):

    @classmethod
    def setUpTestData(cls):
        today = date.today()
        cls.ch = Church.objects.create(
            church_name="church1",
            address="address1",
            opening_date="2023-05-11",
        )
        cls.ch2 = Church.objects.create(
            church_name="church2",
            address="address2",
            opening_date="2023-05-12",
        )
        age_range = [
            today.year - 12,
            today.year - 15,
            today.year - 25,
            today.year - 45,
            today.year - 52,
            today.year - 80,
        ]
        professions = [
            "Travailleur",
            "Entrepreneur",
            "Eleve/Etudiant",
            "Autres",
            "Travailleur",
            "Entrepreneur",
        ]
        marital_status = ["M", "C", "V", "M", "C", "V"]

        for a in range(0, 6):
            Member.objects.create(
                email="test@chms.com" + str(a),
                password="None",
                first_name="John" + str(a),
                last_name="Ashimedua",
                date_joined=today + relativedelta(months=-a),
                church=cls.ch if a % 2 == 0 else cls.ch2,
                birthdate=date(age_range[a], 2, 2),
                profession_type=professions[a],
                gender="F" if a % 3 == 0 else "H",
                marital_status=marital_status[a],
            )

    def test_total_members_for_six_month(self):
        today = date.today()
        r = [
            {
                "month": time_date.list_month[
                    (today + relativedelta(months=-a)).month - 1
                ],
                "count": 0,
            }
            for a in range(5, -1, -1)
        ]
        res1 = services.TotalMembersForSixMonth(self.ch.pk)
        r[5]["count"], r[3]["count"], r[1]["count"] = 1, 1, 1

        self.assertEqual(res1, r)

        res2 = services.TotalMembersForSixMonth(self.ch2.pk)
        r = [
            {
                "month": time_date.list_month[
                    (today + relativedelta(months=-a)).month - 1
                ],
                "count": 0,
            }
            for a in range(5, -1, -1)
        ]
        r[4]["count"], r[2]["count"], r[0]["count"] = 1, 1, 1
        self.assertEqual(res2, r)

    def test_age_range_count(self):
        res = services.AgeRangeCount(self.ch.pk)
        exp_res = [
            {"categorie": "Enfants", "count": 1},
            {"categorie": "Ados", "count": 0},
            {"categorie": "Jeune", "count": 1},
            {"categorie": "Adultes", "count": 0},
            {"categorie": "Agees", "count": 1},
        ]
        self.assertEqual(res, exp_res)

        res = services.AgeRangeCount(self.ch2.pk)
        exp_res = [
            {"categorie": "Enfants", "count": 0},
            {"categorie": "Ados", "count": 1},
            {"categorie": "Jeune", "count": 0},
            {"categorie": "Adultes", "count": 1},
            {"categorie": "Agees", "count": 1},
        ]
        self.assertEqual(res, exp_res)

    def test_profession(self):
        professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]
        res = services.Professions(self.ch.pk)

        exp_res = [{"profession": p, "count": 0, "percent": 0} for p in professions]
        exp_res[0]["count"] = 2
        exp_res[0]["percent"] = 66

        exp_res[2]["count"] = 1
        exp_res[2]["percent"] = 33

        self.assertEqual(res, exp_res)

        res = services.Professions(self.ch2.pk)

        exp_res = [{"profession": p, "count": 0, "percent": 0} for p in professions]
        exp_res[1]["count"] = 2
        exp_res[1]["percent"] = 66

        exp_res[3]["count"] = 1
        exp_res[3]["percent"] = 33

        self.assertEqual(res, exp_res)

    def test_gender(self):
        gender = ["Homme", "Femme"]
        res = services.Gender(self.ch.pk)

        exp_res = [{"sexe": p, "count": 0, "percent": 0} for p in gender]
        exp_res[0]["count"] = 2
        exp_res[0]["percent"] = 66

        exp_res[1]["count"] = 1
        exp_res[1]["percent"] = 33

        self.assertEqual(res, exp_res)

        res = services.Gender(self.ch2.pk)

        exp_res = [{"sexe": p, "count": 0, "percent": 0} for p in gender]
        exp_res[0]["count"] = 2
        exp_res[0]["percent"] = 66

        exp_res[1]["count"] = 1
        exp_res[1]["percent"] = 33

        self.assertEqual(res, exp_res)

    def test_marital_status(self):
        ms = ["Marie", "Celibataire", "Veuf(ve)"]
        res = services.Marital_Status(self.ch.pk)

        exp_res = [{"statut": p, "count": 0, "percent": 0} for p in ms]
        exp_res[0]["count"] = 1
        exp_res[0]["percent"] = 33

        exp_res[1]["count"] = 1
        exp_res[1]["percent"] = 33

        exp_res[2]["count"] = 1
        exp_res[2]["percent"] = 33

        self.assertEqual(res, exp_res)

        res = services.Marital_Status(self.ch2.pk)

        exp_res = [{"statut": p, "count": 0, "percent": 0} for p in ms]
        exp_res[0]["count"] = 1
        exp_res[0]["percent"] = 33

        exp_res[1]["count"] = 1
        exp_res[1]["percent"] = 33

        exp_res[2]["count"] = 1
        exp_res[2]["percent"] = 33

        self.assertEqual(res, exp_res)


class Test_Attendance(APITestCase):

    @classmethod
    def setUpTestData(cls):
        today = date.today()
        cls.ch = Church.objects.create(
            church_name="church1",
            address="address1",
            opening_date="2023-05-11",
        )
        cls.ch2 = Church.objects.create(
            church_name="church2",
            address="address2",
            opening_date="2023-05-12",
        )
        cls.type = Event_Type.objects.create(
            event_type_name = "Culte Mardi",
            weekly_event = True
        )
        
        cls.type2 = Event_Type.objects.create(
            event_type_name = "Culte Vendredi",
            weekly_event = True
        )

        for a in range(0, 10):
            Event.objects.create(
                event_name = "test",
                event_date = date.today() + relativedelta(months=-a),
                men = 10,
                women = 15,
                children = 10,
                total  = 35,
                church = cls.ch if a %2 ==0 else cls.ch2,
                event_type  = cls.type if a%2==0 else cls.type2
            )

    def test_total_attendanc_for_six_month(self):
        today = date.today()
        r = [
            {
                "month": time_date.list_month[
                    (today + relativedelta(months=-a)).month - 1
                ],
                "count": 0,
            }
            for a in range(5, -1, -1)
        ]
        res1 = services.TotalAttendanceForSixMonth(self.ch.pk)
        r[5]["count"], r[3]["count"], r[1]["count"] = 35,35,35

        self.assertEqual(res1, r)

        res2 = services.TotalAttendanceForSixMonth(self.ch2.pk)
        r = [
            {
                "month": time_date.list_month[
                    (today + relativedelta(months=-a)).month - 1
                ],
                "count": 0,
            }
            for a in range(5, -1, -1)
        ]
        r[4]["count"], r[2]["count"], r[0]["count"] = 35,35,35
        self.assertEqual(res2, r)
