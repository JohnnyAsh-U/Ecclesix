from django.urls import path, include
from . import views

urlpatterns = [
    path('connexion', views.Connexion.as_view()),
    path('verify-email', views.VerifyEmail.as_view()),
    path('setup-otp', views.SetupOTP.as_view())
    # path('inscription'),
    # path('verify-email'),
    # path('reinitialisation'),
    # path('reset'),
    # path('reset-password'),
    # path('setup-otp'),
    # path('refresh'),
    # path('deconnexion')
]
