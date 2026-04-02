from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import timedelta
import logging

from members.models import Member
from attendance.models import Attendance
from event.models import Event
from admin_custom.services import get_app_config
from admin_custom.constant import (
    ACTIVE_TO_INACTIVE_MAX_ATTENDED_EVENTS_KEY,
    ACTIVE_TO_INACTIVE_MIN_TOTAL_EVENTS_KEY,
    ACTIVE_TO_INACTIVE_PERIOD_DAYS_KEY,
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Mark active members as inactive based on low attendance"

    def handle(self, *args, **options):
        """
        Process all active members and mark them as inactive if their attendance ratio
        does not meet the configured threshold.
        """
        try:
            # Load configuration values
            max_attended_events = get_app_config(
                ACTIVE_TO_INACTIVE_MAX_ATTENDED_EVENTS_KEY, 0
            )
            min_total_events = get_app_config(
                ACTIVE_TO_INACTIVE_MIN_TOTAL_EVENTS_KEY, 0
            )
            period_days = get_app_config(ACTIVE_TO_INACTIVE_PERIOD_DAYS_KEY, 0)

            # Validate configuration
            if not all([max_attended_events, min_total_events, period_days]):
                logger.warning(
                    "Active to inactive conversion config is incomplete. "
                    f"max_attended_events={max_attended_events}, "
                    f"min_total_events={min_total_events}, period_days={period_days}"
                )
                self.stdout.write(
                    self.style.WARNING(
                        "Configuration incomplete. Please set all required values in AppConfig."
                    )
                )
                return

            # Calculate the evaluation period
            today = timezone.now().date()
            period_start = today - timedelta(days=period_days)

            # Get all active members (excluding visitors)
            active_members = Member.objects.filter(
                is_active=True, 
                status__in=["Membre", "Ouvrier", "Ministre"]
            )

            inactivated_count = 0
            total_members = active_members.count()

            self.stdout.write(
                f"Processing {total_members} active members (period: {period_days} days, "
                f"threshold: {max_attended_events}/{min_total_events})"
            )

            for member in active_members:
                # Calculate attendance statistics for the evaluation period
                attended_events = Attendance.objects.filter(
                    member=member,
                    date__range=[period_start, today],
                ).count()

                # Count total events in the church during the evaluation period
                total_events = Event.objects.filter(
                    church=member.church,
                    event_date__range=[period_start, today],
                ).count()

                # Skip if no events in the period
                if total_events == 0:
                    continue

                # Calculate attendance ratio
                attended_ratio = attended_events / total_events
                max_allowed_ratio = max_attended_events / min_total_events

                logger.info(
                    f"Member: {member.id} ({member.first_name} {member.last_name}) - "
                    f"Attended: {attended_events}/{total_events} = {attended_ratio:.2%} "
                    f"(max allowed: {max_allowed_ratio:.2%})"
                )

                # Mark as inactive if attendance ratio falls below threshold
                if attended_ratio <= max_allowed_ratio:
                    member.is_active = False
                    member.save()
                    inactivated_count += 1

                    logger.info(
                        f"✓ Marked as Inactive: {member.id} "
                        f"({member.first_name} {member.last_name}) - "
                        f"Attendance: {attended_ratio:.2%}"
                    )

            # Log completion
            logger.info(
                f"Active to Inactive conversion job completed. "
                f"Marked {inactivated_count}/{total_members} members as inactive"
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Job completed. Marked {inactivated_count}/{total_members} members as inactive."
                )
            )

        except Exception as e:
            logger.exception(f"Error in active_to_inactive_job: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f"Job failed with error: {str(e)}")
            )
            raise CommandError(f"Job failed: {str(e)}")
