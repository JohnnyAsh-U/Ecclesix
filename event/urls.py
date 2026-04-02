from django.urls import path
from . import views
urlpatterns = [
    path('',views.EventListCreateView.as_view(), name="event-list" ),
    path('/<int:pk>',views.EventUpdateDestroyView.as_view(), name="event-rud" ),
    path('/<int:pk>/attendance', views.EventAttendanceListView.as_view(), name="event-attendance-list"),
    path('/type', views.EventTypeListCreateView.as_view(), name= "event-type-list"),
    path('/type/<int:pk>', views.EventTypeRUDView.as_view(), name= "event-type-list"),
]
