from django.urls import path
from . import views_tenant, views_billing, views_plans, views_storage, views_migration

urlpatterns = [
    
    # Tenants Migrations
    path('/tenants/migrations', views_migration.all_tenants_migration_summary),
    path('/tenants/<int:tenant_id>/migrate', views_migration.run_tenant_migration),
    path('/tenants/<int:tenant_id>/migration-state', views_migration.tenant_migration_state),
    
    
    # Tenant endpoints
    path('/tenants', views_tenant.TenantListCreateView.as_view(), name='internal-tenants-list-create'),
    path('/tenants/<int:tenant_id>', views_tenant.TenantDetailView.as_view(), name='internal-tenant-detail'),
    path('/tenants/<int:tenant_id>/activate', views_tenant.TenantActivateView.as_view(), name='internal-tenant-activate'),
    path('/tenants/<int:tenant_id>/deactivate', views_tenant.TenantDeactivateView.as_view(), name='internal-tenant-deactivate'),
    path('/tenants/<int:tenant_id>/domains', views_tenant.TenantDomainsView.as_view(), name='internal-tenant-domains'),
    path('/tenants/<int:tenant_id>/storage', views_tenant.TenantStorageView.as_view(), name="storage-view"),
    
    
    # Billing endpoints
    path('/billings/recent', views_billing.TenantBillingRecentView.as_view(), name='internal-billings-recent'),
    path('/billings/filter', views_billing.BillingFilterView.as_view(), name='internal-billings-filter'),
    path('/billings/stats', views_billing.BillingStatsView.as_view(), name='internal-billings-stats'),
    path('/billings/create', views_billing.BillingCreateView.as_view(), name='internal-billings-create'),
    path('/billings/change-plan', views_billing.ChangeBillingPlanView.as_view(), name='internal-billings-change-plan'),
    
    # Billing Plans endpoints
    path('/plans', views_plans.BillingPlanListCreateView.as_view(), name='internal-plans-list-create'),
    path('/plans/<int:plan_id>', views_plans.BillingPlanDetailView.as_view(), name='internal-plan-detail'),
    
    # Storage endpoints
    path('/storage', views_storage.TenantStorageListView.as_view(), name='internal-tenants-storage'),
    path('/storage/stats', views_storage.AllTenantsStorageTotalsView.as_view(), name='internal-storage-stats'),
]