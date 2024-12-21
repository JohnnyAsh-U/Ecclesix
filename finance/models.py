from django.db import models
from church.models import Church
from members.models import Member
from event.models import Event
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q, CheckConstraint
from decimal import Decimal
from .utils import encrypt_amount, decrypt_amount


class EncryptedField(models.CharField):
    def get_db_prep_value(self, value, connection, prepared):
        value = super().get_db_prep_value(value, connection, prepared)
        if value is not None:
            return encrypt_amount(value)
            # return value

    def from_db_value(self, value, expression, connection):
        return Decimal(decrypt_amount(value))
        # return value


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
    balance = EncryptedField(max_length=200)
    is_main = models.BooleanField(default=False)
    church = models.ForeignKey(Church, null=True, blank=True, on_delete=models.SET_NULL)
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
        validators=[
            MinValueValidator(Decimal(0.00)),
            MaxValueValidator(Decimal(100.00)),
        ],
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


class Budget(models.Model):
    budget_name = models.CharField("Budget Name", max_length=50)
    allocated_amount = EncryptedField(max_length=100)
    actual_amount = EncryptedField(max_length=100, default=0) 
    start_date = models.DateField()
    end_date = models.DateField()
    category = models.ForeignKey(Category, verbose_name="Budget Category",on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    details = models.JSONField(null=True, blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"
        default_permissions = ()
        permissions = [
            ("ajouter_budget", "Ajouter Budget"),
        ]

    def __str__(self):
        return f"{self.budget_name}"


class Transaction(models.Model):
    """Model definition for Transaction."""

    description = models.CharField("Description", max_length=255, null=True, blank=True)
    amount = EncryptedField("Amount", max_length=100)
    status = models.CharField(
        "Status",
        choices=[
            ("Validated", "Validated"),
            ("Pending", "Pending"),
            ("Rejected", "Rejected"),
        ],
        max_length=50,
        default="Pending",
    )
    transaction_type = models.CharField(
        "Type",
        choices=[
            ("Credit", "Credit"),
            ("Debit", "Debit"),
            ("Transfer", "Transfer"),
        ],
        max_length=50,
    )
    from_account = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True
    )
    to_account = models.ForeignKey(
        Account,
        related_name="to_account",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    added_by = models.ForeignKey(
        Member,
        related_name="added_by",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    approved_by = models.ForeignKey(
        Member, on_delete=models.SET_NULL, null=True, blank=True
    )
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    budget = models.ForeignKey(Budget, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta definition for Transaction."""

        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        default_permissions = ()
        permissions = [
            ("voir_finance", "Voir Finance"),
            ("voir_toutes_finances", "Voir Toutes Finances"),
            ("ajouter_transaction", "Ajouter Transaction"),
            ("confirmer_transaction", "Confirmer Transaction"),
        ]

    def __str__(self):
        return f"{self.description}"
    
    def get_church(self):
        return str(getattr(self.from_account, "church", None))


class Monthly_Balance(models.Model):
    month = models.SmallIntegerField()
    year = models.SmallIntegerField()
    balance = EncryptedField(max_length=150)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Monthly_Balance"
        verbose_name_plural = "Monthly_Balances"
        default_permissions = ()

    def __str__(self):
        return f"{self.account.account_name}"


class Transaction_Log(models.Model):
    action = models.CharField(
        "Action",
        choices=[
            ("Created", "Created"),
            ("Modified", "Modified"),
            ("Deleted", "Deleted"),
            ("Validated", "Validated"),
            ("Rejected", "Rejected"),
        ],
        max_length=50,
    )
    transaction_no = models.IntegerField("Transaction No")
    detail = models.JSONField(null= True, blank=True)
    # new_state = models.JSONField(null= True, blank=True)
    comment = models.CharField("Notes", max_length=255, blank= True, null=True)
    admin = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Transaction_Log"
        verbose_name_plural = "Transaction_Logs"
        default_permissions = ()
        permissions = [
            ("voir_financelog", "Voir Finance Log"),
        ]

    def __str__(self):
        return f"{self.transaction_no} | {self.action}"
