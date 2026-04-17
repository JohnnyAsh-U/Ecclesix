# Prometheus Observability for Ecclesix

## What is collected

- HTTP request count by method, endpoint, status code, and safe tenant grouping
- HTTP request latency histogram
- Error counter for exceptions and 5xx responses
- Database query count and execution time histogram

## Tenant label strategy

Set one of these environment values:

- PROMETHEUS_TENANT_LABEL_MODE=off
  - all requests are aggregated under a single tenant label
- PROMETHEUS_TENANT_LABEL_MODE=grouped
  - public stays public, allowlisted tenants keep their schema name, all others become other
- PROMETHEUS_TENANT_LABEL_MODE=unsafe
  - real tenant schema names are exported for every request
  - use only for low-cardinality environments

Optional allowlist:

- PROMETHEUS_TENANT_LABEL_ALLOWLIST=church1,church2,staging

## Prometheus scrape config

scrape_configs:
  - job_name: ecclesix-api
    metrics_path: /metrics
    static_configs:
      - targets:
          - api.ecclesix.local:8000

## Grafana queries

Request rate:

sum(rate(ecclesix_http_requests_total[5m])) by (method, endpoint)

Error rate percentage:

100 * (
  sum(rate(ecclesix_http_errors_total[5m]))
  /
  sum(rate(ecclesix_http_requests_total[5m]))
)

P95 latency:

histogram_quantile(
  0.95,
  sum(rate(ecclesix_http_request_duration_seconds_bucket[5m])) by (le, endpoint)
)

## Best practices

- Use metrics for low-cardinality service health trends.
- Use logs for per-tenant forensic detail and business events.
- Use traces for request-path debugging across services.
- Restrict the /metrics endpoint to internal networks or a monitoring ingress.
- Prefer grouped tenant labels over raw schema labels in production.
