from django.db import models
from church.models import Church
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q, CheckConstraint
from decimal import Decimal


class Category(models.Model):
    category_name = models.CharField(max_length=70)
    category_type = models.CharField(
        max_length=20,
        choices=[
            ("Debit", "Debit"),
            ("Credit", "Credit"),
            ("Budget", "Budget"),
        ],
    )
    description = models.CharField(max_length=200)

    class Meta:
        verbose_name = "category"
        verbose_name_plural = "categories"
        default_permissions = ()

    def __str__(self):
        return f"{self.category_name}"


class Account(models.Model):
    account_name = models.CharField(max_length=50)
    account_type = models.CharField(
        max_length=10, choices=[("Caisse", "Caisse"), ("Bancaire", "Bancaire")]
    )
    amount = models.CharField(max_length=200)
    is_main = models.BooleanField(default=False)
    church = models.ForeignKey(Church, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "account"
        verbose_name_plural = "accounts"
        default_permissions = ()

    def __str__(self):
        return f"{self.account_name}"


class Transaction_Rule(models.Model):
    rule_name = models.CharField(max_length=100)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(Decimal(0.00)), MaxValueValidator(Decimal(100.00))],
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    church = models.ForeignKey(Church, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            CheckConstraint(
                check=Q(percentage__gte=0.00) & Q(percentage__lte=100.00),
                name="check_percentage",
            )
        ]
        verbose_name = "transaction_rule"
        verbose_name_plural = "transactions_rules"
        unique_together = ["account", "category", "church"]
        default_permissions = ()

    def __str__(self):
        return f"{self.rule_name}"
