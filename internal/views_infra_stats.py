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
