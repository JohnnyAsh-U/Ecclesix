from django.urls import path
from . import views


urlpatterns = [
    path('/members', views.CommunicationMemberListView.as_view(), name='communication-members'),
    path('/announcements', views.TenantAnnouncementListCreateView.as_view(), name='announcement-list'),
    path('/announcements/<int:pk>/', views.TenantAnnouncementDetailView.as_view(), name='announcement-detail'),
    path('/send', views.SendCommunicationView.as_view(), name='communication-send'),    
    # Announcements - for viewing ongoing (published only)
    path('/announcements/ongoing', views.OngoingAnnouncementListView.as_view(), name='announcement-ongoing'),
    
]
