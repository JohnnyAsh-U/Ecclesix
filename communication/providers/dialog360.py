"""
Dialog360 WhatsApp provider implementation.
"""
from .base import BaseProvider, SendResult
from typing import Dict, Any
import requests
import logging

logger = logging.getLogger(__name__)


class Dialog360Provider(BaseProvider):
    """Dialog360 WhatsApp service provider."""

    BASE_URL = "https://api.360dialog.com"

    def __init__(self, credentials: Dict[str, Any]):
        """
        Initialize Dialog360 provider.
        
        Expected credentials:
            - api_key: Dialog360 API key
            - phone_number_id: WhatsApp Business Account phone number ID
            - waba_id: WhatsApp Business Account ID
        """
        super().__init__(credentials)
        self.api_key = credentials.get("api_key")
        self.phone_number_id = credentials.get("phone_number_id")
        self.waba_id = credentials.get("waba_id")

    def send(self, recipient: str, subject: str = None, body: str = None) -> SendResult:
        """Send message via Dialog360."""
        if not self.api_key or not self.phone_number_id:
            return SendResult(
                success=False,
                error="Dialog360 API key or phone_number_id not configured"
            )

        try:
            # Ensure recipient has country code
            if not recipient.startswith("+"):
                recipient = f"+{recipient}"

            response = requests.post(
                f"{self.BASE_URL}/messages",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": recipient.replace("+", ""),  # Dialog360 expects without +
                    "type": "text",
                    "text": {
                        "body": body
                    }
                }
            )

            if response.status_code in [200, 201]:
                data = response.json()
                message_id = data.get("messages", [{}])[0].get("id")
                return SendResult(
                    success=True,
                    provider_message_id=message_id
                )
            else:
                error = response.json().get("error", {}).get("message", "Unknown error")
                logger.error(f"Dialog360 error: {error}")
                return SendResult(
                    success=False,
                    error=error
                )

        except Exception as e:
            logger.exception(f"Dialog360 send failed: {e}")
            return SendResult(
                success=False,
                error=str(e)
            )

    def validate_credentials(self) -> tuple[bool, str]:
        """Test Dialog360 connection."""
        if not self.api_key or not self.phone_number_id:
            return False, "API key and phone_number_id required"

        try:
            response = requests.get(
                f"{self.BASE_URL}/app",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                }
            )

            if response.status_code == 200:
                return True, ""
            else:
                error = response.json().get("error", {}).get("message", "Authentication failed")
                return False, error

        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    def handle_webhook(self, payload: Dict[str, Any]) -> None:
        """
        Handle Dialog360 webhook for delivery status updates.
        Webhook contains message statuses: sent, delivered, read, failed
        """
        try:
            changes = payload.get("entry", [{}])[0].get("changes", [])
            for change in changes:
                value = change.get("value", {})
                statuses = value.get("statuses", [])
                
                for status in statuses:
                    message_id = status.get("id")
                    status_type = status.get("status")
                    # This will be processed in the task handler
                    logger.info(f"Dialog360 webhook: {status_type} for message {message_id}")

        except Exception as e:
            logger.exception(f"Dialog360 webhook handling failed: {e}")
