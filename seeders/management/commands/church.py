import random
from datetime import date

from django.core.management.base import BaseCommand, CommandError
from faker import Faker

from church.models import City, Church, Church_type

from ._tenant_utils import TenantDomainCommandMixin

faker = Faker()
names = ["Bethel", "Power", "Kingdom"]


class Command(TenantDomainCommandMixin, BaseCommand):
    help = "Populates churches table"

    def add_arguments(self, parser):
        self.add_tenant_arguments(parser)

    def seed_data(self):
        types = list(Church_type.objects.all())
        cities = list(City.objects.all())

        if not types or not cities:
            raise CommandError("Seed cities and church types before seeding churches.")

        data = []
        for ch in names:
            data.append(
                Church(
                    church_name=ch,
                    address=faker.address(),
                    opening_date=faker.date_between(start_date=date(2018, 1, 1), end_date=date(2024, 8, 1)),
                    city_id=random.choice(cities).pk,
                    type_id=random.choice(types).pk,
                )
            )

        Church.objects.bulk_create(data)
        self.stdout.write(self.style.SUCCESS("Church Table Seeding Completed"))

    def handle(self, *args, **options):
        self.run_for_domains(options, self.seed_data)
