from django.urls import path, include
from . import views


urlpatterns = [
    path('/liste', views.MinisterWorkerMembers.as_view(), name='member-list1'),
    path('', views.MemberListCreateView.as_view(), name = 'member-list2'),
    path('/<int:pk>', views.MemberRUDView.as_view(), name="member-rud"),
    path('/<int:pk>/role', views.MemberRoleUpdateView.as_view(), name="member-role"),
    path('/<int:pk>/relation', views.RelationshipUpdateDeleteView.as_view(), name="relationship"),
]
