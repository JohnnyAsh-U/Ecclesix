from django.core.management.base import BaseCommand, CommandError
from church.models import City, Church_type, Church
from faker import Faker
from datetime import date
import random

faker = Faker()
names = ["Bethel", "Power", "Kingdom"]
types = Church_type.objects.all()
cities = City.objects.all()
churches = Church_type.objects.all()


class Command(BaseCommand):
    help = "Populates churches table"

    def handle(self, *args, **options):

        data = []
        for ch in names:
            data.append(
                Church(
                    church_name=ch,
                    address = faker.address(),
                    opening_date = faker.date_between(start_date=date(2018, 1, 1), end_date=date(2024, 8,1)),
                    city_id = random.choice(cities).pk,
                    type_id = random.choice(types).pk
                )
            )

        Church.objects.bulk_create(data)

        self.stdout.write(self.style.SUCCESS("Church Table Seeding Completed"))
