from django.urls import path
from . import views, campaign_views


urlpatterns = [
    path('/members', views.CommunicationMemberListView.as_view(), name='communication-members'),
    path('/announcements', views.TenantAnnouncementListCreateView.as_view(), name='announcement-list'),
    path('/announcements/<int:pk>/', views.TenantAnnouncementDetailView.as_view(), name='announcement-detail'),
    path('/send', views.SendCommunicationView.as_view(), name='communication-send'),    
    # Announcements - for viewing ongoing (published only)
    path('/announcements/ongoing', views.OngoingAnnouncementListView.as_view(), name='announcement-ongoing'),
    
    # Campaign
    path('/campaigns', campaign_views.CampaignListCreateAPIView.as_view(), name="campaign-list-create"),
    path('/campaigns/<int:id>', campaign_views.CampaignDetailAPIView.as_view(), name="campagn-detail-view"),
    path('/campaigns/<int:id>/send', campaign_views.CampaignSendAPIView.as_view(), name="campagn-send"),
    path('/campaigns/<int:id>/retry_failed', campaign_views.CampaignRetryFailedAPIView.as_view(), name="campagn-retry-view"),
    path('/campaigns/<int:id>/statistics', campaign_views.CampaignStatsAPIView.as_view(), name="campagn-stats-view"),
    
    
    # Provider
    path('/provider-configs', campaign_views.ProviderConfigListCreateAPIView.as_view(), name="provider-config-list-create"),
    path('/provider-configs/<int:id>', campaign_views.ProviderConfigDeleteAPIView.as_view(), name="provider-config-delete-view"),

    # Webhook endpoint for provider notifications
    path('/webhooks/provider', campaign_views.WebhookView.as_view(), name='provider-webhook'),
]
