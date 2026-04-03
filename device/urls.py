from django.urls import path
from . import views

urlpatterns = [
    path('', views.DeviceListCreateView.as_view(), name='device-list-create'),
    path('/<int:pk>', views.DeviceRegisterDeleteView.as_view(), name='device-register-delete'),
]