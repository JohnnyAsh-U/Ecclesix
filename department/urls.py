from django.urls import path
from . import views

urlpatterns = [
    path('', views.DepartmentCreateListView.as_view(), name="department"),
    path('/<int:pk>', views.DepartmentRUDView.as_view(), name="department-rud"),
    path('/<int:pk>/ajouter', views.AddDepartmentMembers.as_view(), name="add-member-department"),
    path('/<int:pk>/supprimer/<int:mpk>', views.RemoveDepartmentMembers.as_view(), name="remove-member-department"),
]
