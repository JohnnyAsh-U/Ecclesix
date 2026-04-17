from django.core.management.base import BaseCommand

from church.models import Church_type

from ._tenant_utils import TenantDomainCommandMixin

types = ["Siege", "Annexes", "Missionaires"]


class Command(TenantDomainCommandMixin, BaseCommand):
    help = "Populates church type table"

    def add_arguments(self, parser):
        self.add_tenant_arguments(parser)

    def seed_data(self):
        data = [
            Church_type(church_type_name=church_type, description=f"Description of {church_type}")
            for church_type in types
        ]
        Church_type.objects.bulk_create(data)
        self.stdout.write(self.style.SUCCESS("Church Type Seeding Completed"))

    def handle(self, *args, **options):
        self.run_for_domains(options, self.seed_data)
