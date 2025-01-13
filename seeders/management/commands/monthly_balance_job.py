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
        logger.info(
            f"Mise a jour du Solde Du Mois de {time_date.list_month[today.month-1]}"
        )
        try:
            month = today.month
            year = today.year
            all_accounts = Account.objects.all()
            for acc in all_accounts:
                present_account_balance = Monthly_Balance.objects.filter(
                    month=month, year=year, account=acc
                )

                if present_account_balance.exists():
                    month_account_balance = present_account_balance.first()
                    month_account_balance.balance = acc.balance
                    month_account_balance.save()
                    logger.info(f"Updating {present_account_balance.first()}")
                else:
                    Monthly_Balance.objects.create(
                        month=month, year=year, account=acc, balance=acc.balance
                    )
                    logger.info(
                        f"Inserting New Record for {present_account_balance.first()}"
                    )

            logger.info(f"Monthly Balance Job done")
            self.stdout.write(self.style.SUCCESS("Job completed"))
        except Exception as m:
            logger.exception(m)
            self.stdout.write(self.style.ERROR("Job Failed"))

