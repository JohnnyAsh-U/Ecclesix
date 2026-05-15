from django.conf import settings
from django.db import models
from cryptography.fernet import Fernet
import os
import json


class Campaign(models.Model):
    """
    Production campaign model for multi-channel mass communications.
    Schema-scoped (no tenant FK) for django-tenants compatibility.
    """
    
    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("whatsapp", "WhatsApp"),
    ]
    
    PROVIDER_CHOICES = [
        ("resend", "Resend"),
        ("smtp", "SMTP"),
        ("dialog360", "360dialog"),
    ]
    
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("queued", "Queued"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("paused", "Paused"),
    ]

    # Campaign metadata
    name = models.CharField(max_length=255)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    
    # Message content
    subject = models.CharField(max_length=255, blank=True, null=True, help_text="Required for email")
    body = models.TextField()
    
    # Status and scheduling
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft", db_index=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics (denormalized for performance)
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    delivered_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    read_count = models.PositiveIntegerField(default=0, help_text="For email open tracking")
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="campaigns_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True, help_text="Last error if status is 'failed'")

    class Meta:
        ordering = ["-created_at"]
        default_permissions = ()
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["channel", "status"]),
            models.Index(fields=["-scheduled_at"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_channel_display()})"

    @property
    def success_rate(self):
        """Calculate delivery success rate."""
        if self.total_recipients == 0:
            return 0
        return round((self.delivered_count / self.total_recipients) * 100, 2)

    @property
    def pending_count(self):
        """Calculate pending recipients."""
        return self.total_recipients - (self.sent_count + self.failed_count)


class CampaignRecipient(models.Model):
    """
    Individual campaign recipient tracking.
    Tracks delivery status per member.
    """
    
    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("read", "Read"),
        ("failed", "Failed"),
        ("bounced", "Bounced"),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="recipients")
    member = models.ForeignKey("members.Member", on_delete=models.CASCADE, related_name="campaign_recipients")
    
    # Delivery info
    recipient_address = models.CharField(max_length=255, help_text="Email or phone number")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued", db_index=True)
    
    # Provider tracking
    provider_message_id = models.CharField(max_length=255, blank=True, null=True, help_text="Provider's unique message ID")
    
    # Error handling
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    
    # Events
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("campaign", "member")
        default_permissions = ()
        indexes = [
            models.Index(fields=["campaign", "status"]),
            models.Index(fields=["status", "-updated_at"]),
        ]

    def __str__(self):
        return f"{self.campaign.name} → {self.member.email}"


class ProviderConfig(models.Model):
    """
    Encrypted provider credentials storage.
    Schema-scoped (no tenant FK) for django-tenants compatibility.
    """
    
    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("whatsapp", "WhatsApp"),
    ]
    
    PROVIDER_CHOICES = [
        ("resend", "Resend"),
        ("smtp", "SMTP"),
        ("dialog360", "360dialog"),
    ]

    name = models.CharField(max_length=255, help_text="Friendly name for this configuration")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    
    # Encrypted credentials
    _encrypted_credentials = models.TextField(db_column="encrypted_credentials")
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_tested_at = models.DateTimeField(null=True, blank=True)
    test_error = models.TextField(blank=True, help_text="Last test connection error")

    class Meta:
        unique_together = ("channel", "provider")
        default_permissions = ()
        indexes = [
            models.Index(fields=["channel", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_channel_display()} - {self.get_provider_display()})"

    @staticmethod
    def _get_cipher():
        """Get Fernet cipher instance from environment variable."""
        key = os.getenv("ENCRYPTION_KEY")
        if not key:
            raise ValueError("ENCRYPTION_KEY environment variable not set")
        return Fernet(key.encode() if isinstance(key, str) else key)

    @property
    def credentials(self):
        """Decrypt and return credentials."""
        if not self._encrypted_credentials:
            return {}
        try:
            cipher = self._get_cipher()
            decrypted = cipher.decrypt(self._encrypted_credentials.encode())
            return json.loads(decrypted.decode())
        except Exception as e:
            raise ValueError(f"Failed to decrypt credentials: {e}")

    @credentials.setter
    def credentials(self, value):
        """Encrypt and store credentials."""
        cipher = self._get_cipher()
        encrypted = cipher.encrypt(json.dumps(value).encode())
        self._encrypted_credentials = encrypted.decode()


class CommunicationLog(models.Model):
    CHANNEL_CHOICES = (
        ("email", "Email"),
        ("sms", "SMS"),
    )

    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    recipients_count = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    detail = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="communications_sent",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        default_permissions = ()
        permissions = [
            ("envoyer_communication", "Envoyer Communication"),
            ("envoyer_toutes_communications", "Envoyer Toutes Communications"),
        ]

    def __str__(self):
        return f"{self.channel.upper()} #{self.pk}"


class TenantAnnouncement(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
    ]
    
    VISIBILITY_CHOICES = [
        ("all", "All Churches"),
        ("specific", "Specific Churches"),
    ]

    title = models.CharField(max_length=255)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="all")
    
    # For specific church visibility
    target_churches = models.ManyToManyField(
        "church.Church",
        related_name="announcements",
        blank=True,
        help_text="Leave empty if visibility is 'all'"
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenant_announcements_created"
    )
    
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        default_permissions = ()
        indexes = [
            models.Index(fields=["status", "visibility"]),
            models.Index(fields=["-published_at"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
