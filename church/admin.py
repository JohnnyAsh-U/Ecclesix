from django.contrib import admin
from .models import Church, Church_type, City

# Register your models here.

admin.site.register(Church_type)
admin.site.register(Church)
admin.site.register(City)
