import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class PrometheusQueryMixin:
    """Mixin to query Prometheus metrics"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prometheus_url = getattr(settings, 'PROMETHEUS_URL', 'http://localhost:9090')
    
    def query_prometheus(self, query):
        """Execute a PromQL query against Prometheus"""
        try:
            url = f"{self.prometheus_url}/api/v1/query"
            response = requests.get(url, params={'query': query}, timeout=10)
            
            if response.status_code != 200:
                logger.error(f"Prometheus query failed: {response.text}")
                raise Exception(f"Prometheus returned {response.status_code}")
            
            data = response.json()
            if data['status'] != 'success':
                raise Exception(f"Prometheus error: {data.get('error', 'Unknown error')}")
            
            return data['data']['result']
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to connect to Prometheus: {str(e)}")
            raise
	
    def query_prometheus_range(self, query, start, end, step):
        """Execute a range query against Prometheus"""
        try:
            url = f"{self.prometheus_url}/api/v1/query_range"
            response = requests.get(
                url,
                params={
                    'query': query,
                    'start': int(start.timestamp()),
                    'end': int(end.timestamp()),
                    'step': step
                },
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Prometheus range query failed: {response.text}")
                raise Exception(f"Prometheus returned {response.status_code}")
            
            data = response.json()
            if data['status'] != 'success':
                raise Exception(f"Prometheus error: {data.get('error', 'Unknown error')}")
            
            return data['data']['result']
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to connect to Prometheus: {str(e)}")
            raise


class RequestsPerHourView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Request count per hour for the last 12 hours"""
    
    def get(self, request):
        """Returns request count breakdown per hour (last 12 hours)"""
        try:
            # Query: requests per hour for last 12 hours
            now = datetime.utcnow()
            start = now - timedelta(hours=12)
            
            query = 'sum(rate(ecclesix_http_requests_total[1h])) by ()'
            
            results = self.query_prometheus_range(query, start, now, '3600')
            
            hourly_data = []
            for result in results:
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        hourly_data.append({
                            'timestamp': dt.isoformat(),
                            'hour': dt.strftime('%Y-%m-%d %H:00'),
                            'requests_per_second': float(value),
                            'estimated_requests': int(float(value) * 3600)
                        })
            
            return Response({
                'period': 'last_12_hours',
                'data': hourly_data,
                'total_records': len(hourly_data),
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RequestsPerDayView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Request count per day for the last 7 days"""
    
    def get(self, request):
        """Returns request count breakdown per day (last 7 days)"""
        try:
            # Query: requests per day for last 7 days
            now = datetime.utcnow()
            start = now - timedelta(days=7)
            
            query = 'sum(rate(ecclesix_http_requests_total[1d])) by ()'
            
            results = self.query_prometheus_range(query, start, now, '86400')
            
            daily_data = []
            for result in results:
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        daily_data.append({
                            'timestamp': dt.isoformat(),
                            'date': dt.strftime('%Y-%m-%d'),
                            'requests_per_second': float(value),
                            'estimated_requests': int(float(value) * 86400)
                        })
            
            return Response({
                'period': 'last_7_days',
                'data': daily_data,
                'total_records': len(daily_data),
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RequestsPerTenantHourView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Request count per tenant per hour for the last 12 hours"""
    def get(self, request):
        """Returns request count breakdown per tenant per hour (last 12 hours)"""
        try:
            now = datetime.utcnow()
            start = now - timedelta(hours=12)
            
            query = 'sum(rate(ecclesix_http_requests_total[1h])) by (tenant)'
            
            results = self.query_prometheus_range(query, start, now, '3600')
            
            tenant_data = {}
            for result in results:
                tenant = result['metric'].get('tenant', 'unknown')
                if tenant not in tenant_data:
                    tenant_data[tenant] = []
                
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        tenant_data[tenant].append({
                            'timestamp': dt.isoformat(),
                            'hour': dt.strftime('%Y-%m-%d %H:00'),
                            'requests_per_second': float(value),
                            'estimated_requests': int(float(value) * 3600)
                        })
            
            # Format response by tenant
            formatted_data = []
            for tenant, data in sorted(tenant_data.items()):
                formatted_data.append({
                    'tenant': tenant,
                    'hourly_requests': data,
                })
            
            return Response({
                'period': 'last_12_hours',
                'breakdown': 'per_tenant',
                'tenants_count': len(tenant_data),
                'data': formatted_data,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RequestsPerTenantDayView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Request count per tenant per day for the last 7 days"""
    
    def get(self, request):
        """Returns request count breakdown per tenant per day (last 7 days)"""
        try:
            now = datetime.utcnow()
            start = now - timedelta(days=7)
            
            query = 'sum(rate(ecclesix_http_requests_total[1d])) by (tenant)'
            
            results = self.query_prometheus_range(query, start, now, '86400')
            
            tenant_data = {}
            for result in results:
                tenant = result['metric'].get('tenant', 'unknown')
                if tenant not in tenant_data:
                    tenant_data[tenant] = []
                
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        tenant_data[tenant].append({
                            'timestamp': dt.isoformat(),
                            'date': dt.strftime('%Y-%m-%d'),
                            'requests_per_second': float(value),
                            'estimated_requests': int(float(value) * 86400)
                        })
            
            # Format response by tenant
            formatted_data = []
            for tenant, data in sorted(tenant_data.items()):
                formatted_data.append({
                    'tenant': tenant,
                    'daily_requests': data,
                })
            
            return Response({
                'period': 'last_7_days',
                'breakdown': 'per_tenant',
                'tenants_count': len(tenant_data),
                'data': formatted_data,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RequestsSummaryView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Summary of request statistics"""
    
    def get(self, request):
        """Returns summary statistics for requests"""
        try:
            # Get total requests
            query_total = 'sum(increase(ecclesix_http_requests_total[7d]))'
            total_results = self.query_prometheus(query_total)
            total_requests = float(total_results[0]['value'][1]) if total_results else 0
            
            # Get requests by tenant
            query_by_tenant = 'sum(increase(ecclesix_http_requests_total[7d])) by (tenant)'
            tenant_results = self.query_prometheus(query_by_tenant)
            
            tenant_stats = []
            for result in tenant_results:
                tenant = result['metric'].get('tenant', 'unknown')
                count = float(result['value'][1])
                percentage = (count / total_requests * 100) if total_requests > 0 else 0
                tenant_stats.append({
                    'tenant': tenant,
                    'request_count': int(count),
                    'percentage': round(percentage, 2),
                })
            
            # Sort by request count descending
            tenant_stats = sorted(tenant_stats, key=lambda x: x['request_count'], reverse=True)
            
            # Get error rate
            query_errors = 'sum(increase(ecclesix_http_errors_total[7d]))'
            error_results = self.query_prometheus(query_errors)
            error_count = float(error_results[0]['value'][1]) if error_results else 0
            
            error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
            
            return Response({
                'period': 'last_7_days',
                'summary': {
                    'total_requests': int(total_requests),
                    'total_errors': int(error_count),
                    'error_rate_percent': round(error_rate, 2),
                },
                'top_tenants': tenant_stats[:10],
                'unique_tenants': len(tenant_stats),
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CPUUsageView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: CPU usage metrics"""
    
    def get(self, request):
        """Returns current and average CPU usage"""
        try:
            now = datetime.utcnow()
            start = now - timedelta(hours=1)
            
            # Get current CPU usage
            query_current = 'rate(process_cpu_seconds_total[5m])'
            current_results = self.query_prometheus(query_current)
            current_cpu = float(current_results[0]['value'][1]) * 100 if current_results else 0
            
            # Get average CPU usage over last hour
            query_avg = 'avg(rate(process_cpu_seconds_total[5m]))'
            avg_results = self.query_prometheus_range(query_avg, start, now, '300')
            
            cpu_history = []
            for result in avg_results:
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        cpu_history.append({
                            'timestamp': dt.isoformat(),
                            'cpu_percent': round(float(value) * 100, 2),
                        })
            
            avg_cpu = sum(h['cpu_percent'] for h in cpu_history) / len(cpu_history) if cpu_history else 0
            
            return Response({
                'unit': 'percent',
                'current': round(current_cpu, 2),
                'average_last_hour': round(avg_cpu, 2),
                'history': cpu_history,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MemoryUsageView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Memory usage metrics"""
    
    def get(self, request):
        """Returns current and average memory usage"""
        try:
            now = datetime.utcnow()
            start = now - timedelta(hours=1)
            
            # Get current memory usage
            query_current = 'process_resident_memory_bytes'
            current_results = self.query_prometheus(query_current)
            current_memory = float(current_results[0]['value'][1]) if current_results else 0
            
            # Get memory limit (if available)
            query_limit = 'container_memory_limit_bytes'
            limit_results = self.query_prometheus(query_limit)
            memory_limit = float(limit_results[0]['value'][1]) if limit_results else None
            
            # Get memory history
            query_history = 'avg(process_resident_memory_bytes)'
            history_results = self.query_prometheus_range(query_history, start, now, '300')
            
            memory_history = []
            for result in history_results:
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        memory_bytes = float(value)
                        memory_mb = memory_bytes / (1024 * 1024)
                        memory_history.append({
                            'timestamp': dt.isoformat(),
                            'memory_mb': round(memory_mb, 2),
                            'memory_bytes': int(memory_bytes),
                        })
            
            avg_memory = sum(h['memory_mb'] for h in memory_history) / len(memory_history) if memory_history else 0
            
            response_data = {
                'unit': 'bytes',
                'display_unit': 'MB',
                'current_mb': round(current_memory / (1024 * 1024), 2),
                'current_bytes': int(current_memory),
                'average_last_hour_mb': round(avg_memory, 2),
                'history': memory_history,
            }
            
            if memory_limit:
                response_data['limit_mb'] = round(memory_limit / (1024 * 1024), 2)
                response_data['limit_bytes'] = int(memory_limit)
                response_data['usage_percent'] = round((current_memory / memory_limit) * 100, 2)
            
            return Response(response_data)
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DiskUsageView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Disk usage metrics"""
    
    def get(self, request):
        """Returns current disk usage"""
        try:
            # Get disk usage by mountpoint
            query = 'node_filesystem_avail_bytes{fstype!=""}'
            disk_results = self.query_prometheus(query)
            
            disk_data = []
            total_size = 0
            total_available = 0
            
            for result in disk_results:
                mountpoint = result['metric'].get('mountpoint', 'unknown')
                device = result['metric'].get('device', 'unknown')
                fstype = result['metric'].get('fstype', 'unknown')
                
                available_bytes = float(result['value'][1])
                
                # Try to get total size
                query_size = f'node_filesystem_size_bytes{{mountpoint="{mountpoint}"}}'
                size_results = self.query_prometheus(query_size)
                
                if size_results:
                    size_bytes = float(size_results[0]['value'][1])
                    used_bytes = size_bytes - available_bytes
                    used_percent = (used_bytes / size_bytes) * 100 if size_bytes > 0 else 0
                    
                    disk_data.append({
                        'device': device,
                        'mountpoint': mountpoint,
                        'fstype': fstype,
                        'size_gb': round(size_bytes / (1024**3), 2),
                        'used_gb': round(used_bytes / (1024**3), 2),
                        'available_gb': round(available_bytes / (1024**3), 2),
                        'used_percent': round(used_percent, 2),
                    })
                    
                    total_size += size_bytes
                    total_available += available_bytes
            
            total_used = total_size - total_available
            total_used_percent = (total_used / total_size) * 100 if total_size > 0 else 0
            
            return Response({
                'unit': 'bytes',
                'display_unit': 'GB',
                'total': {
                    'size_gb': round(total_size / (1024**3), 2),
                    'used_gb': round(total_used / (1024**3), 2),
                    'available_gb': round(total_available / (1024**3), 2),
                    'used_percent': round(total_used_percent, 2),
                },
                'by_mountpoint': disk_data,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class APILatencyView(PrometheusQueryMixin, APIView):
    permission_classes = []
    authentication_classes = []
    """GET: API latency metrics"""
    
    def get(self, request):
        """Returns API latency statistics"""
        try:
            now = datetime.utcnow()
            start = now - timedelta(hours=1)
            
            # Get p50 latency (50th percentile)
            query_p50 = 'histogram_quantile(0.50, sum(rate(ecclesix_http_request_duration_seconds_bucket[5m])) by (le))'
            p50_results = self.query_prometheus(query_p50)
            p50_latency = float(p50_results[0]['value'][1]) * 1000 if p50_results else 0  # Convert to ms
            
            # Get p95 latency (95th percentile)
            query_p95 = 'histogram_quantile(0.95, sum(rate(ecclesix_http_request_duration_seconds_bucket[5m])) by (le))'
            p95_results = self.query_prometheus(query_p95)
            p95_latency = float(p95_results[0]['value'][1]) * 1000 if p95_results else 0
            
            # Get p99 latency (99th percentile)
            query_p99 = 'histogram_quantile(0.99, sum(rate(ecclesix_http_request_duration_seconds_bucket[5m])) by (le))'
            p99_results = self.query_prometheus(query_p99)
            p99_latency = float(p99_results[0]['value'][1]) * 1000 if p99_results else 0
            
            # Get average latency
            query_avg = 'sum(rate(ecclesix_http_request_duration_seconds_sum[5m])) / sum(rate(ecclesix_http_request_duration_seconds_count[5m]))'
            avg_results = self.query_prometheus(query_avg)
            avg_latency = float(avg_results[0]['value'][1]) * 1000 if avg_results else 0
            
            # Get latency history by percentile
            query_history = 'histogram_quantile(0.95, sum(rate(ecclesix_http_request_duration_seconds_bucket[5m])) by (le))'
            history_results = self.query_prometheus_range(query_history, start, now, '300')
            
            latency_history = []
            for result in history_results:
                if result['values']:
                    for timestamp, value in result['values']:
                        dt = datetime.utcfromtimestamp(int(timestamp))
                        latency_history.append({
                            'timestamp': dt.isoformat(),
                            'p95_ms': round(float(value) * 1000, 2),
                        })
            
            # Get latency by endpoint (top slow endpoints)
            query_slow = 'topk(10, sum by (method, endpoint) (rate(ecclesix_http_request_duration_seconds_sum[5m])) / sum by (method, endpoint) (rate(ecclesix_http_request_duration_seconds_count[5m])))'
            slow_results = self.query_prometheus(query_slow)
            
            slow_endpoints = []
            for result in slow_results:
                method = result['metric'].get('method', 'UNKNOWN')
                endpoint = result['metric'].get('endpoint', 'unknown')
                latency = float(result['value'][1]) * 1000
                slow_endpoints.append({
                    'method': method,
                    'endpoint': endpoint,
                    'avg_latency_ms': round(latency, 2),
                })
            
            return Response({
                'unit': 'milliseconds',
                'percentiles': {
                    'p50': round(p50_latency, 2),
                    'p95': round(p95_latency, 2),
                    'p99': round(p99_latency, 2),
                    'avg': round(avg_latency, 2),
                },
                'history': latency_history,
                'top_slow_endpoints': slow_endpoints,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la requête Prometheus: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
