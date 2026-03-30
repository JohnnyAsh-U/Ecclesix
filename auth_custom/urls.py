from django.urls import path, include
from . import views

urlpatterns = [
    path('/connexion', views.Login.as_view(), name='login'),
    path('/inscription', views.Register.as_view(), name='register'),
    path('/verify-email', views.VerifyEmail.as_view(), name='verify-email'),
    path('/setup-otp', views.SetupOTP.as_view(), name='setup-otp'),
    path('/verify-otp', views.VerifyOTP.as_view(), name='verify-otp'),
    path('/refresh', views.RefreshToken.as_view(), name="refresh-token"),
    path('/reinitialisation', views.Reinitialization.as_view(), name="reinitialization"),
    path('/reset', views.ConfirmReinitialization.as_view(), name="confirm-reinitialization"),
    path('/reset-password', views.ResetPassword.as_view(), name="reset-password"),
    path('/deconnexion', views.Logout.as_view(), name="logout")
] 