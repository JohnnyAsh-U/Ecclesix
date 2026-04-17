import os
import re

from django.conf import settings
from django.db import connections
from django.db.backends.signals import connection_created
from django.dispatch import receiver
from django.http import HttpResponse
from django.views.decorators.http import require_GET
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    REGISTRY,
    CollectorRegistry,
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    multiprocess,
)


UUID_PATTERN = re.compile(r"/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}(?=/|$)")
NUMBER_PATTERN = re.compile(r"/\d+(?=/|$)")
HEX_PATTERN = re.compile(r"/[0-9a-fA-F]{12,}(?=/|$)")

REQUEST_COUNT = Counter(
    "ecclesix_http_requests_total",
    "Total number of HTTP requests processed by Ecclesix.",
    ["method", "endpoint", "status_code", "tenant"],
)

REQUEST_LATENCY = Histogram(
    "ecclesix_http_request_duration_seconds",
    "HTTP request latency in seconds.",
    ["method", "endpoint", "tenant"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)

ERROR_COUNT = Counter(
    "ecclesix_http_errors_total",
    "Total number of HTTP exceptions and 5xx responses.",
    ["method", "endpoint", "error_type", "tenant"],
)

DB_QUERY_COUNT = Counter(
    "ecclesix_db_queries_total",
    "Total number of database queries executed.",
    ["db_alias", "operation", "tenant"],
)

DB_QUERY_LATENCY = Histogram(
    "ecclesix_db_query_duration_seconds",
    "Database query execution time in seconds.",
    ["db_alias", "operation", "tenant"],
    buckets=(0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0),
)

DB_CONNECTION_OPENS_TOTAL = Counter(
    "ecclesix_db_connection_opens_total",
    "Total number of database connections opened by Django.",
    ["db_alias"],
)

DB_CONNECTIONS_OPEN = Gauge(
    "ecclesix_db_connections_open",
    "Number of currently open Django database connections.",
    ["db_alias"],
)


@receiver(connection_created, dispatch_uid="backend.metrics.track_connection_created")
def track_connection_created(sender, connection, **kwargs):
    alias = getattr(connection, "alias", "default")
    DB_CONNECTION_OPENS_TOTAL.labels(db_alias=alias).inc()
    DB_CONNECTIONS_OPEN.labels(db_alias=alias).set(1)


def update_db_connection_metrics():
    for db_connection in connections.all():
        alias = getattr(db_connection, "alias", "default")
        raw_connection = getattr(db_connection, "connection", None)
        is_open = 0

        if raw_connection is not None:
            try:
                is_open = 1 if db_connection.is_usable() else 0
            except Exception:
                is_open = 0

        DB_CONNECTIONS_OPEN.labels(db_alias=alias).set(is_open)


def _get_tenant_label_settings():
    mode = getattr(settings, "PROMETHEUS_TENANT_LABEL_MODE", os.getenv("PROMETHEUS_TENANT_LABEL_MODE", "grouped"))
    allowlist = getattr(settings, "PROMETHEUS_TENANT_LABEL_ALLOWLIST", [])
    return str(mode).lower(), {item for item in allowlist if item}


def get_tenant_label(request=None, tenant=None):
    tenant_obj = tenant or getattr(request, "tenant", None)
    schema_name = getattr(tenant_obj, "schema_name", None) or "public"
    mode, allowlist = _get_tenant_label_settings()

    if mode in {"off", "none", "disabled"}:
        return "all"

    if mode == "unsafe":
        return schema_name

    if schema_name == "public":
        return "public"

    if allowlist and schema_name in allowlist:
        return schema_name

    return "other"


def normalize_endpoint(request):
    match = getattr(request, "resolver_match", None)
    if match and getattr(match, "route", None):
        route = "/" + match.route.lstrip("/")
        return route[:120]

    path = getattr(request, "path", "unknown") or "unknown"
    path = UUID_PATTERN.sub("/{uuid}", path)
    path = HEX_PATTERN.sub("/{token}", path)
    path = NUMBER_PATTERN.sub("/{id}", path)
    return path[:120]


def get_metrics_registry():
    multiproc_dir = os.getenv("PROMETHEUS_MULTIPROC_DIR")
    if multiproc_dir:
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
        return registry
    return REGISTRY


@require_GET
def metrics_view(request):
    update_db_connection_metrics()
    registry = get_metrics_registry()
    return HttpResponse(generate_latest(registry), content_type=CONTENT_TYPE_LATEST)
