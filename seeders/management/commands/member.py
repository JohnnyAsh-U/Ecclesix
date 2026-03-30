from django.core.management.base import BaseCommand, CommandError
from church.models import Church, City
from members.models import Member
from datetime import date
from faker import Faker
import random

faker = Faker()
types = ["Siege", "Annexes", "Missionaires"]
gender_options = ["H", "F"]
professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]
cities = City.objects.all()
churches = Church.objects.all()


class Command(BaseCommand):
    help = "Populates members table"

    def handle(self, *args, **options):

        data = []
        for a in range(5000):
            sex = random.choice(gender_options)
            data.append(
                Member(
                    first_name=(
                        faker.first_name_female()
                        if sex == "F"
                        else faker.first_name_male()
                    ),
                    last_name=(
                        faker.last_name_female()
                        if sex == "F"
                        else faker.last_name_male()
                    ),
                    gender=sex,
                    birthdate=faker.date_between(
                        start_date=date(1950, 1, 1), end_date=date(2024, 8, 1)
                    ),
                    phone=faker.basic_phone_number(),
                    profession_type=random.choice(professions),
                    profession=faker.job(),
                    address=faker.address(),
                    date_joined=faker.date_between(
                        start_date=date(2024, 5, 1), end_date=date(2024, 12, 10)
                    ),
                    email=faker.company_email(),
                    baptism_date=(
                        faker.date_between(
                            start_date=date(2000, 1, 1), end_date=date(2024, 2, 1)
                        )
                        if a % 3 == 0
                        else None
                    ),
                    marital_status=random.choice(["M", "C", "V"]),
                    is_active=False if a % 333 == 0 else True,
                    status=random.choice(
                        ["Ministre", "Ouvrier", "Membre", "Visiteur"]
                    ),
                    category=random.choice(["Ecodim", "Jeunesse", "Adulte"]),
                    is_admin=True if a % 501 == 0 else False,
                    city_id=random.choice(cities).pk,
                    church_id = random.choice(churches).pk
                )
            )

        Member.objects.bulk_create(data)

        self.stdout.write(self.style.SUCCESS("Member table Seeding Completed"))
