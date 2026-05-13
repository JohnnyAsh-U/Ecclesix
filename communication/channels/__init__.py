"""
Channel abstraction layer.
Channels transform campaigns into provider-specific payloads.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class EmailPayload:
    """Normalized email payload."""
    recipient: str
    subject: str
    body: str
    html_body: Optional[str] = None


@dataclass
class WhatsAppPayload:
    """Normalized WhatsApp payload."""
    recipient: str
    body: str
    template_name: Optional[str] = None
    template_parameters: Optional[dict] = None


class BaseChannel(ABC):
    """Abstract channel base class."""

    @abstractmethod
    def transform(self, campaign, recipient_address: str, member=None):
        """
        Transform campaign into provider-specific payload.
        
        Args:
            campaign: Campaign instance
            recipient_address: Email or phone
            member: Member instance (optional)
            
        Returns:
            Channel-specific payload
        """
        pass

    @abstractmethod
    def validate_campaign(self, campaign) -> tuple[bool, str]:
        """
        Validate campaign has all required fields for this channel.
        
        Returns:
            (valid: bool, error_message: str)
        """
        pass


class EmailChannel(BaseChannel):
    """Email channel implementation."""

    def transform(self, campaign, recipient_address: str, member=None) -> EmailPayload:
        """Transform campaign to email payload."""
        return EmailPayload(
            recipient=recipient_address,
            subject=campaign.subject,
            body=campaign.body,
        )

    def validate_campaign(self, campaign) -> tuple[bool, str]:
        """Validate email campaign."""
        if not campaign.subject:
            return False, "Email campaigns require a subject"
        if not campaign.body:
            return False, "Email campaigns require a body"
        return True, ""


class WhatsAppChannel(BaseChannel):
    """WhatsApp channel implementation."""

    def transform(self, campaign, recipient_address: str, member=None) -> WhatsAppPayload:
        """Transform campaign to WhatsApp payload."""
        return WhatsAppPayload(
            recipient=recipient_address,
            body=campaign.body,
        )

    def validate_campaign(self, campaign) -> tuple[bool, str]:
        """Validate WhatsApp campaign."""
        if not campaign.body:
            return False, "WhatsApp campaigns require a body"
        return True, ""
