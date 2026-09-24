from django.conf import settings
from django.db import models



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
