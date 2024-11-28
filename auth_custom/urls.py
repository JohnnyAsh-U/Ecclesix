from django.urls import path, include
from . import views

urlpatterns = [
    path('connexion', views.Login.as_view(), name='login'),
    path('inscription', views.Register.as_view(), name='register'),
    path('verify-email', views.VerifyEmail.as_view(), name='verify-email'),
    path('setup-otp', views.SetupOTP.as_view(), name='setup-otp'),
    path('verify-otp', views.VerifyOTP.as_view(), name='verify-otp'),
    path('refresh', views.RefreshToken.as_view(), name="refresh-token")
    # path('inscription'),
    # path('reinitialisation'),
    # path('reset'),
    # path('reset-password'),
    # path('deconnexion')
]
