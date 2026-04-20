import logging
import os
import uuid
from contextvars import ContextVar
from typing import Any

_REQUEST_CONTEXT: ContextVar[dict[str, Any]] = ContextVar("request_context", default={})


def set_request_context(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    remote_addr = forwarded_for.split(",")[0].strip() if forwarded_for else request.META.get("REMOTE_ADDR", "")
    tenant = getattr(getattr(request, "tenant", None), "schema_name", "public")
    user = getattr(request, "user", None)
    user_id = getattr(user, "pk", None) if getattr(user, "is_authenticated", False) else "anonymous"
    request_headers = getattr(request, "headers", {})
    request_id = request_headers.get("X-Request-ID") or str(uuid.uuid4())

    request.request_id = request_id

    return _REQUEST_CONTEXT.set(
        {
            "service": os.getenv("LOG_SERVICE_NAME", "ecclesix-api"),
            "environment": os.getenv("DJANGO_ENV", "development"),
            "request_id": request_id,
            "tenant": tenant,
            "user_id": str(user_id),
            "remote_addr": remote_addr or "-",
            "method": getattr(request, "method", "-"),
            "path": getattr(request, "path", "-"),
        }
    )


def clear_request_context(token):
    _REQUEST_CONTEXT.reset(token)


class RequestContextFilter(logging.Filter):
    def filter(self, record):
        context = _REQUEST_CONTEXT.get({})
        defaults = {
            "service": os.getenv("LOG_SERVICE_NAME", "ecclesix-api"),
            "environment": os.getenv("DJANGO_ENV", "development"),
            "request_id": "-",
            "tenant": "public",
            "user_id": "anonymous",
            "remote_addr": "-",
            "method": "-",
            "path": "-",
            "status_code": "-",
            "duration_ms": "-",
        }

        for key, default in defaults.items():
            setattr(record, key, context.get(key, getattr(record, key, default)))

        return True
