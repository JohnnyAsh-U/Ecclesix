from django.urls import path
from . import views

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view(), name="attendance-list"),
    path('/<int:pk>', views.AttendanceUpdateDestroyView.as_view(), name="attendance-ud"),
]
