from django.db import models
from django.contrib.auth.models import AbstractUser



class User(AbstractUser):
    
    email = models.EmailField("email address", blank=True, unique=True, null=True)
    is_admin = models.BooleanField(default=False)
    device_id = models.CharField(max_length=100, null=True)
    otp_key = models.CharField(max_length=50, null=True, blank=True, default=None)
    username = None
    verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=100, null=True)
    

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "users"
        verbose_name_plural = "users"
        abstract = True
        
        