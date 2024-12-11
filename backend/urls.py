from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


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
    path('api/dashboard', include('dashboard.urls'))
]
