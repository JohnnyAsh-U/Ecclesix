from .models import Category, Transaction_Rule, Account, Transaction, Transaction_Log, Budget
from rest_framework import serializers
from admin_custom.models import Log
from rest_framework.exceptions import ValidationError
from django.db.models import Sum
from decimal import Decimal
import copy

transaction_french = {"Debit": "Depense", "Credit": "Collecte", "Transfer": "Transfert"}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_categorie" if field == "category_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Categorie",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)


class RuleSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction_Rule
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_regle" if field == "rule_name" else field
            field = "pourcentage" if field == "percentage" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Regle",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)

    def get_church_name(self, obj):
        return obj.church.church_name

    def get_category_name(self, obj):
        return obj.category.category_name

    def get_account_name(self, obj):
        return obj.account.account_name


class AccountSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_compte" if field == "account_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Compte",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)

    def get_church_name(self, obj):
        return obj.church.church_name


class TransactionSerializer(serializers.ModelSerializer):
    from_account_name = serializers.CharField(source="from_account", read_only=True)
    to_account_name = serializers.CharField(source="to_account", read_only=True)
    category_name = serializers.CharField(source="category", read_only=True)
    added_by_name = serializers.CharField(source="added_by", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by", read_only=True)
    event_type_name = serializers.SerializerMethodField()

    church = serializers.SerializerMethodField()

    # to get the accounts filtered by church id attached to each transaction
    accounts = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = "__all__"

    def get_event_type_name(self, obj):
        if hasattr(obj, "event") and hasattr(obj.event, "event_type"):
            return str(obj.event.event_type)

    def get_accounts(self, obj):
        return copy.deepcopy(self.context.get("accounts", None))

    def get_church(self, obj):
        if hasattr(obj.from_account, "church"):
            return {
                "id": obj.from_account.church.id,
                "name": obj.from_account.church.church_name,
            }

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        admin = self.context["request"].user.id
        action = validated_data["status"]
        comment = self.context["comment"]

        # validate or reject
        if action == "Validated" or action == "Rejected":
            admin = self.context["request"].user.id
            details = {
                "resource": "Transaction",
                "id": instance.pk,
                "lib": f"#{instance.pk} {transaction_french[original_instance.transaction_type]} ({original_instance.get_church()})",
            }
            Transaction_Log.objects.create(
                action=validated_data["status"],
                transaction_no=instance.pk,
                admin_id=admin,
                comment=comment,
            )
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account", read_only=True)
    percent = serializers.SerializerMethodField()
    church_name = serializers.SerializerMethodField()
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ['actual_amount']
        
    def get_percent(self, obj):
        return (Decimal(obj.actual_amount) / Decimal(obj.allocated_amount))*100
    
    def get_church_name(self, obj):
        return str(getattr(obj.account, "church", None))



class TransactionLogSerializer(serializers.ModelSerializer):
    admin = serializers.StringRelatedField()

    class Meta:
        model = Transaction_Log
        fields = "__all__"
