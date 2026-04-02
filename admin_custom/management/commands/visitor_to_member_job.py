from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import timedelta
import logging

from members.models import Member
from attendance.models import Attendance
from event.models import Event
from admin_custom.services import get_app_config
from admin_custom.constant import (
    VISITOR_TO_MEMBER_MIN_ATTENDED_EVENTS_KEY,
    VISITOR_TO_MEMBER_MIN_TOTAL_EVENTS_KEY,
    VISITOR_TO_MEMBER_PERIOD_DAYS_KEY,
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Convert visitors to members based on attendance ratio"

    def handle(self, *args, **options):
        """
        Process all visitors and convert them to members if their attendance ratio
        meets or exceeds the configured threshold.
        """
        try:
            # Load configuration values
            min_attended_events = get_app_config(
                VISITOR_TO_MEMBER_MIN_ATTENDED_EVENTS_KEY, 0
            )
            min_total_events = get_app_config(
                VISITOR_TO_MEMBER_MIN_TOTAL_EVENTS_KEY, 0
            )
            period_days = get_app_config(VISITOR_TO_MEMBER_PERIOD_DAYS_KEY, 0)

            # Validate configuration
            if not all([min_attended_events, min_total_events, period_days]):
                logger.warning(
                    "Visitor to member conversion config is incomplete. "
                    f"min_attended_events={min_attended_events}, "
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

            # Get all visitors
            visitors = Member.objects.filter(status="Visiteur", is_active=True)

            promoted_count = 0
            total_visitors = visitors.count()

            self.stdout.write(
                f"Processing {total_visitors} visitors (period: {period_days} days, "
                f"threshold: {min_attended_events}/{min_total_events})"
            )

            for visitor in visitors:
                # Calculate attendance statistics for the evaluation period
                attended_events = Attendance.objects.filter(
                    member=visitor,
                    date__range=[period_start, today],
                ).count()

                # Count total events in the church during the evaluation period
                total_events = Event.objects.filter(
                    church=visitor.church,
                    event_date__range=[period_start, today],
                ).count()

                # Skip if no events in the period
                if total_events == 0:
                    continue

                # Calculate attendance ratio
                attended_ratio = attended_events / total_events
                required_ratio = min_attended_events / min_total_events

                logger.info(
                    f"Visitor: {visitor.id} ({visitor.first_name} {visitor.last_name}) - "
                    f"Attended: {attended_events}/{total_events} = {attended_ratio:.2%} "
                    f"(required: {required_ratio:.2%})"
                )

                # Promote to member if ratio is met
                if attended_ratio >= required_ratio:
                    visitor.status = "Membre"
                    visitor.save()
                    promoted_count += 1

                    logger.info(
                        f"✓ Promoted to Member: {visitor.id} "
                        f"({visitor.first_name} {visitor.last_name})"
                    )

            # Log completion
            logger.info(
                f"Visitor to Member conversion job completed. "
                f"Promoted {promoted_count}/{total_visitors} visitors"
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Job completed. Promoted {promoted_count}/{total_visitors} visitors to member status."
                )
            )

        except Exception as e:
            logger.exception(f"Error in visitor_to_member_job: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f"Job failed with error: {str(e)}")
            )
            raise CommandError(f"Job failed: {str(e)}")
