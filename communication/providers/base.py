"""
Provider abstraction layer.
All provider-specific logic must exist here, never in views or serializers.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class SendResult:
    """Result of a send operation."""
    success: bool
    provider_message_id: str = None
    error: str = None


class BaseProvider(ABC):
    """Abstract provider base class."""
    
    def __init__(self, credentials: Dict[str, Any]):
        """
        Initialize provider with encrypted credentials.
        
        Args:
            credentials: Dict of provider-specific credentials
        """
        self.credentials = credentials

    @abstractmethod
    def send(self, recipient: str, subject: str = None, body: str = None) -> SendResult:
        """
        Send message to recipient.
        
        Args:
            recipient: Email address or phone number
            subject: Message subject (optional, for email)
            body: Message body
            
        Returns:
            SendResult object
        """
        pass

    @abstractmethod
    def validate_credentials(self) -> tuple[bool, str]:
        """
        Test provider connection with current credentials.
        
        Returns:
            (success: bool, error_message: str)
        """
        pass

    @abstractmethod
    def handle_webhook(self, payload: Dict[str, Any]) -> None:
        """
        Handle incoming webhook from provider.
        
        Args:
            payload: Webhook payload from provider
        """
        pass
