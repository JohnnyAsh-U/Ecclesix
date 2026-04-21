from django.core.validators import RegexValidator
from django.db import models
from django.utils.text import slugify
from django_tenants.models import DomainMixin, TenantMixin


domain_validator = RegexValidator(
    regex=r"^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$",
    message="Enter a valid domain without protocol, path, or port.",
)


class BillingPlan(models.Model):

    code = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default="FCFA")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price", "name"]
        indexes = [models.Index(fields=["code"])]

    def __str__(self):
        return f"{self.name} ({self.currency} {self.price})"


class Tenant(TenantMixin):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("custom", "Custom"),
    ]
    
    name = models.SlugField(max_length=80, unique=True)
    church_name = models.CharField(max_length=150)
    domain = models.CharField(max_length=255, unique=True, validators=[domain_validator])
    email = models.EmailField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    plan = models.ForeignKey("BillingPlan", null=True, blank=True, on_delete=models.SET_NULL, related_name="tenants")
    logo = models.ImageField(upload_to="tenant_logos/", null=True, blank=True)
    custom_domain = models.BooleanField(default=False)
    custom_domain_verified = models.BooleanField(default=False)
    custom_logo = models.BooleanField(default=False)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default="monthly")
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


class TenantPaymentHistory(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("paid", "Paid"),
        ("pending", "Pending"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    tenant = models.ForeignKey("Tenant", on_delete=models.CASCADE, related_name="payment_history")
    plan = models.ForeignKey("BillingPlan", null=True, blank=True, on_delete=models.SET_NULL, related_name="payment_history")
    invoice_number = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="FCFA")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")
    month = models.CharField(max_length=20, blank=True, default="")
    year = models.CharField(max_length=4, blank=True, default="")
    payment_method = models.CharField(max_length=100, blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_at", "-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["invoice_number"]),
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.tenant.church_name}"


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
        
        
        
class ProviderInformation(models.Model):
    provider_name = models.CharField(max_length=100)
    provider_email = models.EmailField()
    provider_phone = models.CharField(max_length=20, blank=True, default="")
    provider_address = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider_name}"
