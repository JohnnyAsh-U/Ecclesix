from django.core.validators import RegexValidator
from django.db import models
from django.utils.text import slugify
from django_tenants.models import DomainMixin, TenantMixin


domain_validator = RegexValidator(
    regex=r"^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$",
    message="Enter a valid domain without protocol, path, or port.",
)


class Tenant(TenantMixin):
    name = models.SlugField(max_length=80, unique=True)
    church_name = models.CharField(max_length=150)
    domain = models.CharField(max_length=255, unique=True, validators=[domain_validator])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    auto_create_schema = True
    # auto_drop_schema = False

    class Meta:
        ordering = ["church_name"]
        indexes = [
            models.Index(fields=["domain", "is_active"]),
            models.Index(fields=["name", "is_active"]),
            models.Index(fields=["schema_name"]),
        ]

    def __str__(self):
        return f"{self.church_name} ({self.schema_name})"

    def save(self, *args, **kwargs):
        base_name = self.name or self.church_name
        self.name = slugify(base_name)
        self.domain = self.domain.strip().lower().rstrip(".")
        if not self.schema_name:
            self.schema_name = self.name.replace("-", "_")
        super().save(*args, **kwargs)


class TenantDomain(DomainMixin):
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["domain"]
        indexes = [models.Index(fields=["domain", "is_active"])]

    def __str__(self):
        return self.domain

    def save(self, *args, **kwargs):
        self.domain = self.domain.strip().lower().rstrip(".")
        super().save(*args, **kwargs)
