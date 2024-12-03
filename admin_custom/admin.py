from django.contrib import admin
from .models import Role
from django.contrib.auth.models import Permission

# Register your models here.

admin.site.register(Role)
admin.site.register(Permission)
