from django.core.management.base import BaseCommand, CommandError
from church.models import City
from faker import Faker

faker = Faker()
cities = ["Abidjan", "Yakro", "San Pedro"]


class Command(BaseCommand):
    help = "Populates city table"

    def handle(self, *args, **options):

        data = []
        for city in cities:
            data.append(
                City(city_name=city)
            )
        
        City.objects.bulk_create(data)

        self.stdout.write(
            self.style.SUCCESS('City Seeding Completed')
        )
