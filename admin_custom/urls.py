from django.urls import path, include
from . import views


urlpatterns = [
   path('/logs', views.LogView.as_view(), name='logs'),
   path('/permissions', views.AdminPermissions.as_view(), name='admin-permissions'),
   path('/roles', views.RolesListCreateView.as_view(), name='role-createlist'),
   path('/<int:pk>', views.AddAdmin, name="add-remove-admin"),
   path('/<int:pk>/su', views.AddSuperAdmin, name="add-remove-superadmin"),
   path('', views.AdminListView.as_view(), name= "admin-list")
]
