from django.core.management.base import BaseCommand

from event.models import Event_Type

from ._tenant_utils import TenantDomainCommandMixin

event_types = ["Culte de Mardi", "Culte de Vendredi", "Culte de Dimanche"]


class Command(TenantDomainCommandMixin, BaseCommand):
    help = "Populates event type table"

    def add_arguments(self, parser):
        self.add_tenant_arguments(parser)

    def seed_data(self):
        data = [Event_Type(event_type_name=ev, weekly_event=True) for ev in event_types]
        Event_Type.objects.bulk_create(data)
        self.stdout.write(self.style.SUCCESS("Event Type Table Seeding Completed"))

    def handle(self, *args, **options):
        self.run_for_domains(options, self.seed_data)
