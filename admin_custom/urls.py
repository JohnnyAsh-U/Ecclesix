from django.urls import path, include
from . import views


urlpatterns = [
   path('/permissions', views.AdminPermissions.as_view(), name='admin-permissions')
]
