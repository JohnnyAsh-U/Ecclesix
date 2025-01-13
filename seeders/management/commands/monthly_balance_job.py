from finance.models import Account, Monthly_Balance
from django.utils import timezone
from backend.utils import time_date
from django.core.management.base import BaseCommand, CommandError


import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update Monthly Balance DB Table"

    def handle(self, *args, **options):
        today = timezone.now()
        logger.info(f"Mise a jour du Solde Du Mois de {time_date.list_month[today.month-1]}")


        self.stdout.write(
            self.style.SUCCESS('Job complete')
        )