from django.urls import path, include
from . import views


urlpatterns = [
   path('/logs', views.LogView.as_view(), name='logs'),
   path('/permissions', views.AdminPermissions.as_view(), name='admin-permissions')
]
