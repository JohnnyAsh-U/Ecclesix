from django.core.management.base import BaseCommand

from church.models import City

from ._tenant_utils import TenantDomainCommandMixin

cities = ["Abidjan", "Yakro", "San Pedro"]


class Command(TenantDomainCommandMixin, BaseCommand):
    help = "Populates city table"

    def add_arguments(self, parser):
        self.add_tenant_arguments(parser)

    def seed_data(self):
        data = [City(city_name=city) for city in cities]
        City.objects.bulk_create(data)
        self.stdout.write(self.style.SUCCESS("City Seeding Completed"))

    def handle(self, *args, **options):
        self.run_for_domains(options, self.seed_data)
