from django.urls import path
from . import views


urlpatterns = [
    path('/members', views.CommunicationMemberListView.as_view(), name='communication-members'),
    path('/send', views.SendCommunicationView.as_view(), name='communication-send'),
]
