import random
from datetime import date

from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand, CommandError

from church.models import Church
from event.models import Event, Event_Type

from ._tenant_utils import TenantDomainCommandMixin


class Command(TenantDomainCommandMixin, BaseCommand):
    help = "Populates event table"

    def add_arguments(self, parser):
        self.add_tenant_arguments(parser)

    def seed_data(self):
        event_types = {
            ev.event_type_name: ev
            for ev in Event_Type.objects.filter(weekly_event=True)
        }
        churches = list(Church.objects.all())

        required_event_types = ["Culte de Mardi", "Culte de Vendredi", "Culte de Dimanche"]
        if not churches or any(name not in event_types for name in required_event_types):
            raise CommandError("Seed churches and weekly event types before seeding events.")

        ev_date = date(2019, 12, 31)
        data = []
        while ev_date < date.today():
            for ch in churches:
                men = random.randint(20, 30)
                women = random.randint(30, 40)
                children = random.randint(10, 20)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types["Culte de Mardi"],
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            ev_date = ev_date + relativedelta(days=+3)

            for ch in churches:
                men = random.randint(40, 50)
                women = random.randint(50, 60)
                children = random.randint(30, 40)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types["Culte de Vendredi"],
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            ev_date = ev_date + relativedelta(days=+2)

            for ch in churches:
                men = random.randint(60, 80)
                women = random.randint(70, 90)
                children = random.randint(50, 70)
                total = men + women + children
                data.append(
                    Event(
                        event_date=ev_date,
                        event_type=event_types["Culte de Dimanche"],
                        men=men,
                        women=women,
                        children=children,
                        total=total,
                        church=ch,
                    )
                )

            ev_date = ev_date + relativedelta(days=+2)

        Event.objects.bulk_create(data)
        self.stdout.write(self.style.SUCCESS("Event Table Seeding Completed"))

    def handle(self, *args, **options):
        self.run_for_domains(options, self.seed_data)
