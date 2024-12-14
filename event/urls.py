from django.urls import path
from . import views
urlpatterns = [
    path('',views.EventListCreateView.as_view(), name="event-list" ),
    path('/<int:pk>',views.EventView.as_view(), name="event" )
]
