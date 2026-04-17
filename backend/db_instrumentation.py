import re
import time
from contextlib import ExitStack

from django.db import connections

from .metrics import DB_QUERY_COUNT, DB_QUERY_LATENCY


SQL_OPERATION_RE = re.compile(r"^\s*([A-Z]+)", re.IGNORECASE)


def get_sql_operation(sql):
    if not sql:
        return "other"

    match = SQL_OPERATION_RE.match(sql)
    if not match:
        return "other"

    operation = match.group(1).lower()
    if operation in {"select", "insert", "update", "delete"}:
        return operation
    return "other"


class DatabaseMetricsWrapper:
    def __init__(self, tenant_label):
        self.tenant_label = tenant_label

    def __call__(self, execute, sql, params, many, context):
        operation = get_sql_operation(sql)
        alias = getattr(context.get("connection"), "alias", "default")
        start = time.perf_counter()
        try:
            return execute(sql, params, many, context)
        finally:
            duration = time.perf_counter() - start
            DB_QUERY_COUNT.labels(db_alias=alias, operation=operation, tenant=self.tenant_label).inc()
            DB_QUERY_LATENCY.labels(db_alias=alias, operation=operation, tenant=self.tenant_label).observe(duration)


def instrument_database_connections(tenant_label):
    stack = ExitStack()
    for connection in connections.all():
        stack.enter_context(connection.execute_wrapper(DatabaseMetricsWrapper(tenant_label)))
    return stack
