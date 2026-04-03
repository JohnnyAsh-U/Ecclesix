from django.db import models

# Create your models here.

class Device(models.Model):
    identifier = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    brand_name = models.CharField(max_length=100)
    device_name = models.CharField(max_length=100)
    app_version = models.CharField(max_length=50)
    is_registered = models.BooleanField(default=False)    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "device"
        verbose_name_plural = "devices"
        default_permissions = ()

    def __str__(self):
        return self.identifier
