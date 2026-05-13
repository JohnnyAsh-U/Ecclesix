"""
Resend email provider implementation.
"""
from .base import BaseProvider, SendResult
from typing import Dict, Any
import requests
import logging

logger = logging.getLogger(__name__)


class ResendProvider(BaseProvider):
    """Resend email service provider."""
    
    BASE_URL = "https://api.resend.com"
    
    def __init__(self, credentials: Dict[str, Any]):
        """
        Initialize Resend provider.
        
        Expected credentials:
            - api_key: Resend API key
            - from_email: Sender email address
        """
        super().__init__(credentials)
        self.api_key = credentials.get("api_key")
        self.from_email = credentials.get("from_email")

    def send(self, recipient: str, subject: str = None, body: str = None) -> SendResult:
        """Send email via Resend."""
        if not self.api_key or not self.from_email:
            return SendResult(
                success=False,
                error="Resend API key or from_email not configured"
            )

        try:
            response = requests.post(
                f"{self.BASE_URL}/emails",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": self.from_email,
                    "to": recipient,
                    "subject": subject,
                    "html": body,
                }
            )

            if response.status_code in [200, 201]:
                data = response.json()
                return SendResult(
                    success=True,
                    provider_message_id=data.get("id")
                )
            else:
                error = response.json().get("message", "Unknown error")
                logger.error(f"Resend error: {error}")
                return SendResult(
                    success=False,
                    error=error
                )

        except Exception as e:
            logger.exception(f"Resend send failed: {e}")
            return SendResult(
                success=False,
                error=str(e)
            )

    def validate_credentials(self) -> tuple[bool, str]:
        """Test connection to Resend."""
        if not self.api_key or not self.from_email:
            return False, "API key and from_email required"

        try:
            response = requests.get(
                f"{self.BASE_URL}/account",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                }
            )

            if response.status_code == 200:
                return True, ""
            else:
                error = response.json().get("message", "Authentication failed")
                return False, error

        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    def handle_webhook(self, payload: Dict[str, Any]) -> None:
        """
        Handle Resend webhook.
        Webhook events: sent, delivered, bounced, complained, failed
        """
        event_type = payload.get("type")
        provider_message_id = payload.get("data", {}).get("id")

        # Status mapping from Resend to our model
        status_map = {
            "sent": "sent",
            "delivered": "delivered",
            "bounced": "bounced",
            "complained": "bounced",
            "failed": "failed",
        }

        if event_type in status_map:
            # This will be processed in the task handler
            logger.info(f"Resend webhook: {event_type} for message {provider_message_id}")
