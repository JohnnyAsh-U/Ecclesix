from django.contrib import admin

from .models import BillingPlan, Tenant, TenantDomain, TenantPaymentHistory
from django_tenants.admin import TenantAdminMixin


class TenantDomainInline(admin.TabularInline):
    model = TenantDomain
    extra = 1


@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ("church_name", "name", "schema_name", "domain", "plan", "is_active", "created_at")
    search_fields = ("church_name", "name", "schema_name", "domain")
    list_filter = ("is_active", "created_at", "plan")
    inlines = [TenantDomainInline]


@admin.register(BillingPlan)
class BillingPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "price", "currency", "created_at")
    search_fields = ("name", "code")
    list_filter = ("currency", "created_at")


@admin.register(TenantPaymentHistory)
class TenantPaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "tenant", "plan", "amount", "currency", "status", "paid_at")
    search_fields = ("invoice_number", "tenant__church_name")
    list_filter = ("status", "currency", "paid_at")
