import logging
import time
from types import SimpleNamespace
import hmac

# from asgiref.sync import iscoroutinefunction
from inspect import iscoroutinefunction
from django.conf import settings
from django.db import connection
from django.utils.decorators import sync_and_async_middleware
from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import get_public_schema_name
from django.http import JsonResponse

from .db_instrumentation import instrument_database_connections
from .logging_utils import clear_request_context, set_request_context
from .metrics import ERROR_COUNT, REQUEST_COUNT, REQUEST_LATENCY, get_tenant_label, normalize_endpoint

request_logger = logging.getLogger("backend.request")


class MetricsAwareTenantMainMiddleware(TenantMainMiddleware):
    
    def get_tenant(self, domain_model, hostname):
        """Override get_tenant to check if tenant and domain are active."""
        domain = domain_model.objects.select_related('tenant').get(domain=hostname)
        tenant = domain.tenant
        
        # Check if tenant is active
        if not tenant.is_active:
            raise self.TENANT_NOT_FOUND_EXCEPTION(f'Tenant "{hostname}" is inactive')
        
        # Check if domain is active
        if not domain.is_active:
            raise self.TENANT_NOT_FOUND_EXCEPTION(f'Domain "{hostname}" is inactive')
        
        return tenant
    
    
    def process_request(self, request):
        metrics_path = getattr(settings, "PROMETHEUS_METRICS_PATH", "/metrics")
        if request.path.rstrip("/") == metrics_path.rstrip("/"):
            connection.set_schema_to_public()
            request.tenant = SimpleNamespace(schema_name=get_public_schema_name())
            self.setup_url_routing(request, force_public=True)
            return None
        
        return super().process_request(request)


@sync_and_async_middleware
def RequestLoggingMiddleware(get_response):
    metrics_path = getattr(settings, "PROMETHEUS_METRICS_PATH", "/metrics")
    def should_skip(path):
        return path.rstrip("/") == metrics_path.rstrip("/")

    async def async_middleware(request):
        if should_skip(request.path):
            return await get_response(request)

        token = set_request_context(request)
        response = None
        start = time.perf_counter()

        try:
            response = await get_response(request)
            return response
        except Exception:
            request_logger.exception("request_failed")
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            status_code = getattr(response, "status_code", 500)

            if response is not None:
                response["X-Request-ID"] = getattr(request, "request_id", "")

            request_logger.info(
                "request_completed",
                extra={"status_code": status_code, "duration_ms": duration_ms},
            )
            clear_request_context(token)

    def sync_middleware(request):
        if should_skip(request.path):
            return get_response(request)

        token = set_request_context(request)
        response = None
        start = time.perf_counter()

        try:
            response = get_response(request)
            return response
        except Exception:
            request_logger.exception("request_failed")
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            status_code = getattr(response, "status_code", 500)

            if response is not None:
                response["X-Request-ID"] = getattr(request, "request_id", "")

            request_logger.info(
                "request_completed",
                extra={"status_code": status_code, "duration_ms": duration_ms},
            )
            clear_request_context(token)

    if iscoroutinefunction(get_response):
        return async_middleware
    return sync_middleware


@sync_and_async_middleware
def InternalAPIMiddleware(get_response):
    def is_internal_path(path: str) -> bool:
        p = str(path)
        return p.startswith("/internal/") or p.startswith("/api/v1/internal/")

    async def async_middleware(request):
        if is_internal_path(request.path):
            token = request.headers.get("X-Internal-Token", "")
            expected = getattr(settings, "INTERNAL_API_SECRET", "")
            if not hmac.compare_digest(token, expected):
                return JsonResponse({"detail": "Forbidden"}, status=403)
        return await get_response(request)

    def sync_middleware(request):
        if is_internal_path(request.path):
            token = request.headers.get("X-Internal-Token", "")
            expected = getattr(settings, "INTERNAL_API_SECRET", "")
            if not hmac.compare_digest(token, expected):
                return JsonResponse({"detail": "Forbidden"}, status=403)
        return get_response(request)

    if iscoroutinefunction(get_response):
        return async_middleware
    return sync_middleware


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
