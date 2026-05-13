"""
Production campaign service.
This is the business logic layer - no provider-specific logic here.
"""
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from communication.models import Campaign, CampaignRecipient, ProviderConfig
from communication.factories import ProviderFactory, ChannelFactory
from members.models import Member
from typing import List, Tuple
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


class CampaignService:
    """Service for campaign operations."""

    @staticmethod
    @transaction.atomic
    def create_campaign(
        channel: str,
        provider: str,
        name: str,
        body: str,
        subject: str = None,
        member_ids: List[int] = None,
        scheduled_at: str = None,
        created_by=None,
    ) -> Campaign:
        """
        Create a new campaign with recipients.
        
        This method:
        1. Validates provider config exists
        2. Creates campaign
        3. Fetches members
        4. Bulk creates recipients
        5. Queues for processing
        
        Args:
            channel: 'email' or 'whatsapp'
            provider: Provider name (resend, smtp, dialog360)
            name: Campaign name
            body: Message body
            subject: Email subject (required for email)
            member_ids: List of member IDs to target
            scheduled_at: ISO datetime string for scheduling
            created_by: User who created campaign
            
        Returns:
            Campaign instance
            
        Raises:
            ValueError: If validation fails
        """
        # Validate provider config exists and is active
        provider_config = ProviderConfig.objects.filter(
            channel=channel,
            provider=provider,
            is_active=True
        ).first()

        if not provider_config:
            raise ValueError(f"Provider {provider} for {channel} not configured or inactive")

        # Validate campaign data
        channel_obj = ChannelFactory.create(channel)
        
        # Create temporary campaign for validation
        temp_campaign = Campaign(
            channel=channel,
            provider=provider,
            subject=subject,
            body=body
        )
        
        valid, error = channel_obj.validate_campaign(temp_campaign)
        if not valid:
            raise ValueError(error)

        # Fetch members (respect tenant scope via django-tenants)
        members = Member.objects.filter(id__in=member_ids or [])
        if not members.exists():
            raise ValueError("No valid members selected")

        # Create campaign
        campaign = Campaign.objects.create(
            channel=channel,
            provider=provider,
            name=name,
            subject=subject,
            body=body,
            status="draft",
            scheduled_at=scheduled_at,
            created_by=created_by,
            total_recipients=members.count(),
        )

        # Bulk create recipients
        recipients_to_create = []
        for member in members:
            recipient_address = (
                member.email if channel == "email" else member.phone
            )
            
            if not recipient_address:
                logger.warning(f"Member {member.id} has no {channel} address")
                continue

            recipients_to_create.append(
                CampaignRecipient(
                    campaign=campaign,
                    member=member,
                    recipient_address=recipient_address,
                    status="queued",
                )
            )

        CampaignRecipient.objects.bulk_create(recipients_to_create, batch_size=500)

        # Update recipient count
        campaign.total_recipients = len(recipients_to_create)
        campaign.status = "queued"
        campaign.save(update_fields=["total_recipients", "status"])

        logger.info(f"Created campaign {campaign.id} with {len(recipients_to_create)} recipients")

        return campaign

    @staticmethod
    def send_recipient(recipient: CampaignRecipient) -> bool:
        """
        Send message to a single recipient.
        
        This method:
        1. Gets provider config
        2. Gets provider instance
        3. Gets channel instance
        4. Transforms campaign to payload
        5. Sends via provider
        6. Updates recipient status
        
        Args:
            recipient: CampaignRecipient instance
            
        Returns:
            Success boolean
        """
        try:
            campaign = recipient.campaign

            # Get provider config
            provider_config = ProviderConfig.objects.get(
                channel=campaign.channel,
                provider=campaign.provider,
                is_active=True
            )

            # Create provider and channel
            provider_instance = ProviderFactory.create(
                campaign.provider,
                provider_config.credentials
            )
            channel_instance = ChannelFactory.create(campaign.channel)

            # Transform campaign to payload
            payload = channel_instance.transform(
                campaign,
                recipient.recipient_address,
                recipient.member
            )

            # Send via provider
            result = provider_instance.send(
                recipient=payload.recipient,
                subject=getattr(payload, "subject", None),
                body=payload.body
            )

            if result.success:
                recipient.status = "sent"
                recipient.sent_at = timezone.now()
                recipient.provider_message_id = result.provider_message_id
                recipient.retry_count = 0
                recipient.save(update_fields=[
                    "status", "sent_at", "provider_message_id", "retry_count"
                ])

                # Increment campaign sent count
                Campaign.objects.filter(id=campaign.id).update(
                    sent_count=Campaign.objects.filter(id=campaign.id).values_list("sent_count")[0][0] + 1
                )

                logger.info(f"Sent to recipient {recipient.id}")
                return True

            else:
                recipient.status = "failed"
                recipient.error_message = result.error
                recipient.retry_count += 1
                recipient.save(update_fields=[
                    "status", "error_message", "retry_count"
                ])

                # Increment campaign failed count
                Campaign.objects.filter(id=campaign.id).update(
                    failed_count=Campaign.objects.filter(id=campaign.id).values_list("failed_count")[0][0] + 1
                )

                logger.warning(f"Failed to send to recipient {recipient.id}: {result.error}")
                return False

        except Exception as e:
            logger.exception(f"Error sending to recipient {recipient.id}: {e}")
            recipient.status = "failed"
            recipient.error_message = str(e)
            recipient.save(update_fields=["status", "error_message"])
            return False

    @staticmethod
    def get_campaign_stats(campaign: Campaign) -> dict:
        """Get campaign statistics."""
        return {
            "total_recipients": campaign.total_recipients,
            "sent_count": campaign.sent_count,
            "delivered_count": campaign.delivered_count,
            "failed_count": campaign.failed_count,
            "read_count": campaign.read_count,
            "pending_count": campaign.pending_count,
            "success_rate": campaign.success_rate,
        }

    @staticmethod
    def test_provider(channel: str, provider: str, credentials: dict) -> Tuple[bool, str]:
        """
        Test provider connection with credentials.
        
        Args:
            channel: Channel name
            provider: Provider name
            credentials: Provider credentials
            
        Returns:
            (success: bool, error_message: str)
        """
        try:
            provider_instance = ProviderFactory.create(provider, credentials)
            return provider_instance.validate_credentials()
        except Exception as e:
            logger.exception(f"Provider test failed: {e}")
            return False, str(e)

    @staticmethod
    def retry_failed_recipients(campaign: Campaign, max_retries: int = 3) -> int:
        """
        Retry failed recipients up to max_retries times.
        
        Args:
            campaign: Campaign instance
            max_retries: Maximum retry attempts
            
        Returns:
            Number of recipients retried
        """
        failed_recipients = CampaignRecipient.objects.filter(
            campaign=campaign,
            status="failed",
            retry_count__lt=max_retries
        )

        count = 0
        for recipient in failed_recipients:
            if CampaignService.send_recipient(recipient):
                count += 1

        logger.info(f"Retried {count} recipients for campaign {campaign.id}")
        return count
