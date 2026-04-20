from rest_framework import serializers

from .models import BillingPlan, Tenant, TenantPaymentHistory


class BillingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingPlan
        fields = [
            "id",
            "code",
            "name",
            "price",
            "currency",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TenantPaymentHistorySerializer(serializers.ModelSerializer):
    tenant_id = serializers.IntegerField(source="tenant.id", read_only=True)
    plan_id = serializers.IntegerField(source="plan.id", read_only=True, allow_null=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = TenantPaymentHistory
        fields = [
            "id",
            "tenant_id",
            "plan_id",
            "plan_name",
            "invoice_number",
            "amount",
            "currency",
            "status",
            "month",
            "year",
            "payment_method",
            "paid_at",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "tenant_id",
            "plan_id",
            "plan_name",
            "created_at",
        ]


class TenantBillingSerializer(serializers.ModelSerializer):
    tenant_id = serializers.IntegerField(source="id", read_only=True)
    plan = BillingPlanSerializer(read_only=True)
    payment_history = TenantPaymentHistorySerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            "tenant_id",
            "name",
            "church_name",
            "domain",
            "billing_cycle",
            "is_active",
            "custom_domain",
            "custom_domain_verified",
            "custom_logo",
            "logo",
            "logo_url",
            "plan",
            "payment_history",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "tenant_id",
            "name",
            "church_name",
            "domain",
            "billing_cycle",
            "is_active",
            "custom_domain",
            "custom_domain_verified",
            "custom_logo",
            "logo_url",
            "plan",
            "payment_history",
            "created_at",
            "updated_at",
        ]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if not obj.logo:
            return None
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url


class TenantLogoSerializer(serializers.ModelSerializer):
    tenant_id = serializers.IntegerField(source="id", read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = ["tenant_id", "church_name", "logo", "logo_url", "custom_logo"]
        read_only_fields = ["tenant_id", "church_name", "logo_url", "custom_logo"]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if not obj.logo:
            return None
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url
