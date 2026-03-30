from django.core.management.base import BaseCommand, CommandError
from church.models import Church
from event.models import Event_Type, Event
from datetime import date
from faker import Faker
import random
from dateutil.relativedelta import relativedelta

faker = Faker()
event_types = Event_Type.objects.filter(weekly_event=True)
churches = Church.objects.all()


class Command(BaseCommand):
    help = "Populates event table"

    def handle(self, *args, **options):

        ev_date = date(2019, 12, 31)
        data = []
        while ev_date < date.today():

            # culte de mardi
            for ch in churches:
                men = random.randint(20, 30)
                women = random.randint(30, 40)
                children = random.randint(10, 20)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types.filter(
                            event_type_name="Culte de Mardi"
                        ).first(),
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            # increase the date to friday
            ev_date = ev_date + relativedelta(days=+3)

            # culte de vendredi
            for ch in churches:
                men = random.randint(40, 50)
                women = random.randint(50, 60)
                children = random.randint(30, 40)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types.filter(
                            event_type_name="Culte de Vendredi"
                        ).first(),
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            # increase the date to sunday
            ev_date = ev_date + relativedelta(days=+2)

            # culte de vendredi
            for ch in churches:
                men = random.randint(60, 80)
                women = random.randint(70, 90)
                children = random.randint(50, 70)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types.filter(
                            event_type_name="Culte de Dimanche"
                        ).first(),
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            # increase the date to sunday
            ev_date = ev_date + relativedelta(days=+2)

        Event.objects.bulk_create(data)

        self.stdout.write(self.style.SUCCESS("Event Table Seeding Completed"))
