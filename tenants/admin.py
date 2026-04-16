from django.contrib import admin

from .models import Tenant, TenantDomain
from django_tenants.admin import TenantAdminMixin


class TenantDomainInline(admin.TabularInline):
    model = TenantDomain
    extra = 1


@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ("church_name", "name", "schema_name", "domain", "is_active", "created_at")
    search_fields = ("church_name", "name", "schema_name", "domain")
    list_filter = ("is_active", "created_at")
    inlines = [TenantDomainInline]
