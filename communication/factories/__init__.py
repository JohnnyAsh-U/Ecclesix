"""
Provider and Channel factories for creating instances.
This is where provider logic is registered and instantiated.
"""
from typing import Type, Dict, Any
from communication.providers.base import BaseProvider
from communication.providers import ResendProvider
from communication.providers.smtp import SMTPProvider
from communication.providers.dialog360 import Dialog360Provider
from communication.channels import EmailChannel, WhatsAppChannel, BaseChannel
import logging

logger = logging.getLogger(__name__)


class ProviderFactory:
    """Factory for creating provider instances."""
    
    # Provider registry - add new providers here
    _providers: Dict[str, Type[BaseProvider]] = {
        "resend": ResendProvider,
        "smtp": SMTPProvider,
        "dialog360": Dialog360Provider,
    }

    @classmethod
    def create(cls, provider: str, credentials: Dict[str, Any]) -> BaseProvider:
        """
        Create provider instance.
        
        Args:
            provider: Provider name (resend, smtp, dialog360)
            credentials: Provider credentials dict
            
        Returns:
            Provider instance
            
        Raises:
            ValueError: If provider not found
        """
        if provider not in cls._providers:
            raise ValueError(f"Unknown provider: {provider}")

        provider_class = cls._providers[provider]
        return provider_class(credentials)

    @classmethod
    def register_provider(cls, name: str, provider_class: Type[BaseProvider]):
        """
        Register a new provider.
        Use this to add new providers without modifying this file.
        
        Args:
            name: Provider identifier
            provider_class: Provider class
        """
        cls._providers[name] = provider_class
        logger.info(f"Registered provider: {name}")

    @classmethod
    def get_available_providers(cls) -> list[str]:
        """Get list of available providers."""
        return list(cls._providers.keys())


class ChannelFactory:
    """Factory for creating channel instances."""
    
    # Channel registry - add new channels here
    _channels: Dict[str, Type[BaseChannel]] = {
        "email": EmailChannel,
        "whatsapp": WhatsAppChannel,
    }

    @classmethod
    def create(cls, channel: str) -> BaseChannel:
        """
        Create channel instance.
        
        Args:
            channel: Channel name (email, whatsapp)
            
        Returns:
            Channel instance
            
        Raises:
            ValueError: If channel not found
        """
        if channel not in cls._channels:
            raise ValueError(f"Unknown channel: {channel}")

        channel_class = cls._channels[channel]
        return channel_class()

    @classmethod
    def register_channel(cls, name: str, channel_class: Type[BaseChannel]):
        """
        Register a new channel.
        Use this to add new channels without modifying this file.
        
        Args:
            name: Channel identifier
            channel_class: Channel class
        """
        cls._channels[name] = channel_class
        logger.info(f"Registered channel: {name}")

    @classmethod
    def get_available_channels(cls) -> list[str]:
        """Get list of available channels."""
        return list(cls._channels.keys())
