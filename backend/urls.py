from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from backend.views import FrontendAppView
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api-auth/', include('rest_framework.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    
    #api routes
    path('api/auth', include('auth_custom.urls')),
    path('api/membre', include('members.urls')),
    path('api/eglise', include('church.urls')),
    path('api/admin', include('admin_custom.urls')),
    path('api/dashboard', include('dashboard.urls')),
    path('api/departement', include('department.urls')),
    path('api/evenement', include('event.urls')),
    path('api/finance', include('finance.urls')),
    path('api/communication', include('communication.urls')),
    path('api/attendance', include('attendance.urls')),
    path('api/device', include('device.urls')),

    # Catch-all to serve React
    re_path(r'^(?!static|assets|media).*$', FrontendAppView.as_view(), name='frontend'),
]

# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static('/assets/', document_root=settings.STATIC_ROOT)
