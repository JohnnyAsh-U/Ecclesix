from django.urls import path
from . import views_tenant, views_billing, views_plans, views_storage, views_migration, views_infra_stats

urlpatterns = [
    
    # Infrastructure & Stats endpoints
    path('/stats/requests/hourly', views_infra_stats.RequestsPerHourView.as_view(), name='internal-stats-requests-hourly'),
    path('/stats/requests/daily', views_infra_stats.RequestsPerDayView.as_view(), name='internal-stats-requests-daily'),
    path('/stats/requests/tenants-hourly', views_infra_stats.RequestsPerTenantHourView.as_view(), name='internal-stats-requests-tenants-hourly'),
    path('/stats/requests/tenants-daily', views_infra_stats.RequestsPerTenantDayView.as_view(), name='internal-stats-requests-tenants-daily'),
    path('/stats/requests/summary', views_infra_stats.RequestsSummaryView.as_view(), name='internal-stats-requests-summary'),
    path('/stats/cpu', views_infra_stats.CPUUsageView.as_view(), name='internal-stats-cpu'),
    path('/stats/memory', views_infra_stats.MemoryUsageView.as_view(), name='internal-stats-memory'),
    path('/stats/disk', views_infra_stats.DiskUsageView.as_view(), name='internal-stats-disk'),
    path('/stats/api-latency', views_infra_stats.APILatencyView.as_view(), name='internal-stats-api-latency'),
    
    # Tenants Migrations
    path('/tenants/migrations', views_migration.all_tenants_migration_summary),
    path('/tenants/<str:schema_name>/migrate', views_migration.run_tenant_migration),
    path('/tenants/<str:schema_name>/migration-state', views_migration.tenant_migration_state),
    
    
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
    path('/billings/create', views_billing.BillingCreateView.as_view(), name='internal-billings-create'),
    path('/billings/<int:payment_id>/cancel', views_billing.BillingCancelView.as_view(), name='internal-billing-cancel'),
    
    # Billing Plans endpoints
    path('/plans', views_plans.BillingPlanListCreateView.as_view(), name='internal-plans-list-create'),
    path('/plans/<int:plan_id>', views_plans.BillingPlanDetailView.as_view(), name='internal-plan-detail'),
    
    # Storage endpoints
    path('/churches/storage', views_storage.ChurchStorageListView.as_view(), name='internal-churches-storage'),
    path('/storage/summary', views_storage.StorageSummaryView.as_view(), name='internal-storage-summary'),
]