from rest_framework import serializers
from tenants.models import Tenant, BillingPlan


class TenantCreateSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(max_length=150, required=True)
    schema_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    domain = serializers.CharField(max_length=255, required=True)
    superadmin_email = serializers.EmailField(required=True)
    plan_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    billing_cycle = serializers.ChoiceField(
        choices=["monthly", "yearly", "custom"],
        required=False,
        default="monthly"
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = Tenant
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


    def validate_plan_code(self, value):
        if value:
            plan = BillingPlan.objects.filter(code=value).first()
            if not plan:
                raise serializers.ValidationError("Plan de facturation non trouvé.")
        return value
    
    def validate_schema_name(self, value):
        if value:
            if Tenant.objects.filter(schema_name=value.strip().lower()).exists():
                raise serializers.ValidationError("Le nom du schéma existe déjà.")
        return value.strip().lower()
