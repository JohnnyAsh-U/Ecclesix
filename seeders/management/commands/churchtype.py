from django.core.management.base import BaseCommand, CommandError
from church.models import Church_type
from faker import Faker

faker = Faker()
types = ["Siege", "Annexes", "Missionaires"]


class Command(BaseCommand):
    help = "Populates church type table"

    def handle(self, *args, **options):

        data = []
        for type in types:
            data.append(
                Church_type(church_type_name=type, description=f"Description of {type}")
            )
        
        Church_type.objects.bulk_create(data)

        self.stdout.write(
            self.style.SUCCESS('Church Type Seeding Completed')
        )
