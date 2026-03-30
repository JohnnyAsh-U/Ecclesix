from django.core.management.base import BaseCommand, CommandError
from church.models import City
from event.models import Event_Type
from faker import Faker

faker = Faker()
event_types = ["Culte de Mardi", "Culte de Vendredi", "Culte de Dimanche"]


class Command(BaseCommand):
    help = "Populates event type table"

    def handle(self, *args, **options):

        data = []
        for ev in event_types:
            data.append(Event_Type(event_type_name=ev, weekly_event=True))

        Event_Type.objects.bulk_create(data)

        self.stdout.write(self.style.SUCCESS("Event Type Table Seeding Completed"))
