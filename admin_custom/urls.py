from django.urls import path, include
from . import views


urlpatterns = [
   path('/logs', views.LogView.as_view(), name='logs'),
   path('/config', views.AppConfigView, name='app-config'),
   path('/email-config', views.EmailConfigView, name='email-config'),
   path('/email-config/test', views.TestEmailConfigView, name='email-config-test'),
   path('/support-email', views.SupportEmailView, name='support-email'),
   path('/permissions', views.AdminPermissions.as_view(), name='admin-permissions'),
   path('/roles', views.RolesListCreateView.as_view(), name='role-createlist'),
   path('/roles/<int:pk>', views.RoleUpdateDestroyView.as_view(), name='role-update-delete'),
   path('/roles/<int:pk>/permissions', views.AddPermissionToRole, name="add-permissions"),
   path('/database/backup', views.DatabaseBackupView, name='database-backup'),
   path('/database/restore', views.DatabaseRestoreView, name='database-restore'),
   path('/<int:pk>', views.AddAdmin, name="add-remove-admin"),
   path('/<int:pk>/su', views.AddSuperAdmin, name="add-remove-superadmin"),
   path('', views.AdminListView.as_view(), name= "admin-list"),
]
