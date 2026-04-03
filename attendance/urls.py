from django.urls import path
from . import views

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view(), name="attendance-list"),
    path('/mobile-sync', views.MobileOutboxSyncView.as_view(), name="attendance-mobile-sync"),
    path('/<int:pk>', views.AttendanceUpdateDestroyView.as_view(), name="attendance-ud"),
]
