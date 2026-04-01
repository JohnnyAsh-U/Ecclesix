from django.conf import settings
from django.db import models


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
