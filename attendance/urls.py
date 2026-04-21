from django.urls import path
from . import views

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view(), name="attendance-list"),
    path('/members', views.AttendanceMembersListView.as_view(), name="attendance-members-list"),
    path('/evenements', views.AttendanceEventsListView.as_view(), name="attendance-events-list"),
    path('/mobile-sync', views.MobileOutboxSyncView.as_view(), name="attendance-mobile-sync"),
    path('/stats/<int:event_id>', views.EventAttendanceStatsView.as_view(), name="event-attendance-stats"),
    path('/mark-present/<int:event_id>', views.BulkMarkAttendanceView.as_view(), name="bulk-mark-attendance"),
    path('/<int:pk>', views.AttendanceUpdateDestroyView.as_view(), name="attendance-ud"),
]
