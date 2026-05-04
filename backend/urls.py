from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static
from .metrics import metrics_view
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('metrics', metrics_view, name='metrics'),
    path('metrics/', metrics_view, name='metrics-slash'),
    # path('api-auth/', include('rest_framework.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    #api routes
    path('api/v1/auth', include('auth_custom.urls')),
    path('api/v1/membre', include('members.urls')),
    path('api/v1/eglise', include('church.urls')),
    path('api/v1/admin', include('admin_custom.urls')),
    path('api/v1/dashboard', include('dashboard.urls')),
    path('api/v1/departement', include('department.urls')),
    path('api/v1/evenement', include('event.urls')),
    path('api/v1/finance', include('finance.urls')),
    path('api/v1/communication', include('communication.urls')),
    path('api/v1/attendance', include('attendance.urls')),
    path('api/v1/device', include('device.urls')),
    path('api/v1/tenant', include('tenants.urls')),
    path('api/v1/multimedia', include('multimedia.urls')),
    path('api/v1/internal', include('internal.urls')),

    # Catch-all to serve React
    # re_path(r'^(?!static|assets|media).*$', FrontendAppView.as_view(), name='frontend'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# urlpatterns += static('/assets/', document_root=settings.STATIC_ROOT)
