"""
SMTP email provider implementation.
"""
from .base import BaseProvider, SendResult
from typing import Dict, Any
from django.core.mail import EmailMessage
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class SMTPProvider(BaseProvider):
    """SMTP email service provider."""

    def __init__(self, credentials: Dict[str, Any]):
        """
        Initialize SMTP provider.
        
        Expected credentials:
            - host: SMTP host
            - port: SMTP port
            - username: SMTP username
            - password: SMTP password
            - use_tls: Use TLS (bool)
            - use_ssl: Use SSL (bool)
            - from_email: Sender email address
        """
        super().__init__(credentials)

    def send(self, recipient: str, subject: str = None, body: str = None) -> SendResult:
        """Send email via SMTP."""
        try:
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=self.credentials.get("from_email"),
                to=[recipient],
                connection=self._get_connection()
            )
            email.send(fail_silently=False)

            return SendResult(
                success=True,
                provider_message_id=f"smtp_{recipient}_{int(__import__('time').time())}"
            )

        except Exception as e:
            logger.exception(f"SMTP send failed: {e}")
            return SendResult(
                success=False,
                error=str(e)
            )

    def _get_connection(self):
        """Create SMTP connection."""
        from django.core.mail import get_connection

        return get_connection(
            backend="django.core.mail.backends.smtp.EmailBackend",
            host=self.credentials.get("host"),
            port=int(self.credentials.get("port", 587)),
            username=self.credentials.get("username"),
            password=self.credentials.get("password"),
            use_tls=self.credentials.get("use_tls", True),
            use_ssl=self.credentials.get("use_ssl", False),
            fail_silently=False,
        )

    def validate_credentials(self) -> tuple[bool, str]:
        """Test SMTP connection."""
        try:
            connection = self._get_connection()
            connection.open()
            connection.close()
            return True, ""
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"SMTP validation failed: {error_msg}")
            return False, error_msg

    def handle_webhook(self, payload: Dict[str, Any]) -> None:
        """
        SMTP doesn't support webhooks.
        Delivery tracking would need to be implemented via read receipts or other means.
        """
        logger.info("SMTP doesn't support webhooks")
