from django.urls import path, include
from . import views

urlpatterns = [
    path('/ville', views.CityListCreateView.as_view(), name='city'),
    path('/ville/<int:pk>', views.CityRUDView.as_view(), name='city-rud'),
    path('/type', views.TypeListCreateView.as_view(), name='type'),
    path('/type/<int:pk>', views.TypeRUDView.as_view(), name='type-rud'),
    path('', views.ChurchListCreateView.as_view(), name='church'),
    path('/<int:pk>', views.ChurchRUDView.as_view(), name='church')
]
