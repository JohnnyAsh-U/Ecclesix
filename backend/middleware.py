import time
from types import SimpleNamespace

# from asgiref.sync import iscoroutinefunction
from inspect import iscoroutinefunction
from django.conf import settings
from django.db import connection
from django.utils.decorators import sync_and_async_middleware
from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import get_public_schema_name

from .db_instrumentation import instrument_database_connections
from .metrics import ERROR_COUNT, REQUEST_COUNT, REQUEST_LATENCY, get_tenant_label, normalize_endpoint


class MetricsAwareTenantMainMiddleware(TenantMainMiddleware):
    def process_request(self, request):
        metrics_path = getattr(settings, "PROMETHEUS_METRICS_PATH", "/metrics")
        if request.path.rstrip("/") == metrics_path.rstrip("/"):
            connection.set_schema_to_public()
            request.tenant = SimpleNamespace(schema_name=get_public_schema_name())
            self.setup_url_routing(request, force_public=True)
            return None
        return super().process_request(request)


@sync_and_async_middleware
def PrometheusMetricsMiddleware(get_response):
    metrics_path = getattr(settings, "PROMETHEUS_METRICS_PATH", "/metrics")

    def should_skip(path):
        return path.rstrip("/") == metrics_path.rstrip("/")

    async def async_middleware(request):
        if should_skip(request.path):
            return await get_response(request)

        method = request.method or "UNKNOWN"
        tenant_label = get_tenant_label(request=request)
        response = None
        error_type = None
        start = time.perf_counter()

        with instrument_database_connections(tenant_label):
            try:
                response = await get_response(request)
                return response
            except Exception as exc:
                error_type = exc.__class__.__name__
                raise
            finally:
                endpoint = normalize_endpoint(request)
                status_code = str(getattr(response, "status_code", 500))
                REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code, tenant=tenant_label).inc()
                REQUEST_LATENCY.labels(method=method, endpoint=endpoint, tenant=tenant_label).observe(time.perf_counter() - start)
                if error_type:
                    ERROR_COUNT.labels(method=method, endpoint=endpoint, error_type=error_type, tenant=tenant_label).inc()
                elif status_code.startswith("5"):
                    ERROR_COUNT.labels(method=method, endpoint=endpoint, error_type="5xx", tenant=tenant_label).inc()

    def sync_middleware(request):
        if should_skip(request.path):
            return get_response(request)

        method = request.method or "UNKNOWN"
        tenant_label = get_tenant_label(request=request)
        response = None
        error_type = None
        start = time.perf_counter()

        with instrument_database_connections(tenant_label):
            try:
                response = get_response(request)
                return response
            except Exception as exc:
                error_type = exc.__class__.__name__
                raise
            finally:
                endpoint = normalize_endpoint(request)
                status_code = str(getattr(response, "status_code", 500))
                REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code, tenant=tenant_label).inc()
                REQUEST_LATENCY.labels(method=method, endpoint=endpoint, tenant=tenant_label).observe(time.perf_counter() - start)
                if error_type:
                    ERROR_COUNT.labels(method=method, endpoint=endpoint, error_type=error_type, tenant=tenant_label).inc()
                elif status_code.startswith("5"):
                    ERROR_COUNT.labels(method=method, endpoint=endpoint, error_type="5xx", tenant=tenant_label).inc()

    if iscoroutinefunction(get_response):
        return async_middleware
    return sync_middleware
