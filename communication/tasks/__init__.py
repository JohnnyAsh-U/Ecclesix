"""
Dramatiq async tasks for campaign processing.
CRITICAL: All workers MUST preserve schema context using django-tenants.
"""
import dramatiq
from django.conf import settings
from django_tenants.utils import schema_context
from communication.models import Campaign, CampaignRecipient
from communication.campaign_service import CampaignService
import logging

logger = logging.getLogger(__name__)


# Configure Dramatiq with RabbitMQ or Redis
@dramatiq.actor(queue_name="campaigns", time_limit=600000)
def process_campaign(campaign_id: int, schema_name: str):
    """
    Process campaign recipients and send messages.
    
    CRITICAL: Uses schema_context to preserve tenant isolation.
    
    Args:
        campaign_id: Campaign ID to process
        schema_name: Schema name for django-tenants
    """
    with schema_context(schema_name):
        try:
            campaign = Campaign.objects.get(id=campaign_id)
            logger.info(f"Processing campaign {campaign_id} in schema {schema_name}")

            # Get queued recipients in batches
            batch_size = 200
            recipients = CampaignRecipient.objects.filter(
                campaign=campaign,
                status="queued"
            ).select_related("member", "campaign")

            total = recipients.count()
            if total == 0:
                campaign.status = "completed"
                campaign.save(update_fields=["status"])
                logger.info(f"Campaign {campaign_id} has no recipients")
                return

            campaign.status = "processing"
            campaign.save(update_fields=["status"])

            # Process recipients in batches
            sent_count = 0
            for offset in range(0, total, batch_size):
                batch = list(recipients[offset : offset + batch_size])

                for recipient in batch:
                    CampaignService.send_recipient(recipient)
                    sent_count += 1

                    # Log progress every 50 recipients
                    if sent_count % 50 == 0:
                        logger.info(f"Campaign {campaign_id}: {sent_count}/{total} sent")

            # Finalize campaign
            campaign.refresh_from_db()
            campaign.status = "completed"
            campaign.save(update_fields=["status"])
            logger.info(f"Campaign {campaign_id} completed: {campaign.sent_count}/{total}")

        except Campaign.DoesNotExist:
            logger.error(f"Campaign {campaign_id} not found")
        except Exception as e:
            logger.exception(f"Campaign processing failed for {campaign_id}: {e}")
            try:
                campaign.status = "failed"
                campaign.error_message = str(e)
                campaign.save(update_fields=["status", "error_message"])
            except:
                pass


@dramatiq.actor(queue_name="campaigns", time_limit=300000)
def send_single_recipient(recipient_id: int, schema_name: str):
    """
    Send message to a single recipient.
    
    CRITICAL: Uses schema_context to preserve tenant isolation.
    
    Args:
        recipient_id: CampaignRecipient ID
        schema_name: Schema name for django-tenants
    """
    with schema_context(schema_name):
        try:
            recipient = CampaignRecipient.objects.select_related("campaign", "member").get(
                id=recipient_id
            )
            CampaignService.send_recipient(recipient)
        except CampaignRecipient.DoesNotExist:
            logger.error(f"Recipient {recipient_id} not found")
        except Exception as e:
            logger.exception(f"Failed to send recipient {recipient_id}: {e}")


@dramatiq.actor(queue_name="campaigns", time_limit=600000)
def retry_failed_campaign_recipients(campaign_id: int, schema_name: str, max_retries: int = 3):
    """
    Retry failed recipients for a campaign.
    
    CRITICAL: Uses schema_context to preserve tenant isolation.
    
    Args:
        campaign_id: Campaign ID
        schema_name: Schema name for django-tenants
        max_retries: Maximum retry attempts
    """
    with schema_context(schema_name):
        try:
            campaign = Campaign.objects.get(id=campaign_id)
            retried = CampaignService.retry_failed_recipients(campaign, max_retries)
            logger.info(f"Retried {retried} recipients for campaign {campaign_id}")
        except Campaign.DoesNotExist:
            logger.error(f"Campaign {campaign_id} not found")
        except Exception as e:
            logger.exception(f"Retry failed for campaign {campaign_id}: {e}")
