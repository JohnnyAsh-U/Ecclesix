from django.urls import path

from .views import BillingPlanListView, TenantBillingView, TenantBrandingView, PublicAnnouncementListCreateView

urlpatterns = [
    path('/plans', BillingPlanListView.as_view(), name='billing-plan-list'),
    path('/billing', TenantBillingView.as_view(), name='tenant-billing'),
    path('/branding', TenantBrandingView.as_view(), name='tenant-branding'),
    path('/announcements', PublicAnnouncementListCreateView.as_view(), name='public-announcement-list'),
]
