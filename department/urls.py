from django.urls import path
from . import views

urlpatterns = [
    path('', views.DepartmentCreateListView.as_view(), name="department"),
]
