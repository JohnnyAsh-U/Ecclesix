from django.urls import path, include
from . import views


urlpatterns = [
    path('/liste', views.MinisterWorkerMembers, name='member-list1'),
    path('/', views.MemberListCreateView.as_view(), name = 'member-list2'),
    path('/<int:pk>', views.MemberRUDView.as_view(), name="member-rud")
]
