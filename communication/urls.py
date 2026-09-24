from django.urls import path
from . import views


urlpatterns = [
    path('/announcements', views.TenantAnnouncementListCreateView.as_view(), name='announcement-list'),
    path('/announcements/<int:pk>/', views.TenantAnnouncementDetailView.as_view(), name='announcement-detail'),
    # Announcements - for viewing ongoing (published only)
    path('/announcements/ongoing', views.OngoingAnnouncementListView.as_view(), name='announcement-ongoing'),
]
