from django.urls import path, include
from .views import Connexion

urlpatterns = [
    path('connexion', Connexion.as_view()),
    # path('inscription'),
    # path('verify-email'),
    # path('reinitialisation'),
    # path('reset'),
    # path('reset-password'),
    # path('setup-otp'),
    # path('refresh'),
    # path('deconnexion')
]
