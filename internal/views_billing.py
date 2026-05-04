from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime

from tenants.models import Tenant, TenantPaymentHistory, BillingPlan


class TenantBillingRecentView(APIView):
	"""GET: Get tenants with most recent billing"""
	def get(self, request):
		"""
		Returns list of tenants with their most recent billing info:
		church_name, plan, amount, currency, status, month, year, paid_at, notes
		"""
		tenants = Tenant.objects.select_related('plan').all()
		data = []
		
		for tenant in tenants:
			# Get most recent payment
			recent_payment = TenantPaymentHistory.objects.filter(
				tenant=tenant
			).order_by('-paid_at', '-created_at').first()
			
			if recent_payment:
				data.append({
					'tenant_id': tenant.id,
					'church_name': tenant.church_name,
					'plan': recent_payment.plan.code if recent_payment.plan else None,
					'amount': str(recent_payment.amount),
					'currency': recent_payment.currency,
					'status': recent_payment.status,
					'month': recent_payment.month,
					'year': recent_payment.year,
					'paid_at': recent_payment.paid_at,
					'notes': recent_payment.notes,
				})
		
		return Response(data)


class BillingFilterView(APIView):
	"""GET: Filter billings by month and year"""
	def get(self, request):
		"""
		Query params: month (1-12), year (YYYY)
		Returns: invoice_number, church_name, status, amount, currency, month, year, paid_at, payment_method, plan
		"""
		month = request.query_params.get('month')
		year = request.query_params.get('year')
		
		if not month or not year:
			return Response(
				{'detail': 'Les paramètres month et year sont requis'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		try:
			month = int(month)
			year = int(year)
			if month < 1 or month > 12:
				raise ValueError("Month must be between 1 and 12")
		except ValueError as e:
			return Response(
				{'detail': f'Paramètres invalides: {str(e)}'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		payments = TenantPaymentHistory.objects.select_related(
			'tenant', 'plan'
		).filter(
			month=str(month),
			year=str(year)
		).order_by('-created_at')
		
		data = [
			{
				'invoice_number': p.invoice_number,
				'church_name': p.tenant.church_name,
				'status': p.status,
				'amount': str(p.amount),
				'currency': p.currency,
				'month': p.month,
				'year': p.year,
				'paid_at': p.paid_at,
				'payment_method': p.payment_method,
				'plan': p.plan.code if p.plan else None,
			}
			for p in payments
		]
		
		return Response(data)


class BillingCreateView(APIView):
	"""POST: Add a billing for a tenant"""
	def post(self, request):
		"""
		Request body:
		{
			"tenant_id": 1,
			"plan_code": "basic",
			"month": "1",
			"year": "2026",
			"amount": "10000",
			"payment_method": "carte",
			"paid_at": "2026-01-15T10:00:00Z",
			"notes": "Payment received"
		}
		"""
		tenant_id = request.data.get('tenant_id')
		plan_code = request.data.get('plan_code')
		month = request.data.get('month', '')
		year = request.data.get('year', '')
		amount = request.data.get('amount')
		payment_method = request.data.get('payment_method', '')
		paid_at = request.data.get('paid_at')
		notes = request.data.get('notes', '')
		
		# Validate tenant
		if not tenant_id:
			return Response(
				{'detail': 'tenant_id est requis'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		tenant = Tenant.objects.filter(id=tenant_id).first()
		if not tenant:
			return Response(
				{'detail': 'Locataire non trouvé'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		# Validate amount
		if not amount:
			return Response(
				{'detail': 'amount est requis'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		try:
			amount = float(amount)
		except ValueError:
			return Response(
				{'detail': 'amount doit être un nombre'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		# Get plan if provided
		plan = None
		if plan_code:
			plan = BillingPlan.objects.filter(code=plan_code).first()
		
		# Validate paid_at if provided
		if paid_at:
			try:
				if isinstance(paid_at, str):
					paid_at = datetime.fromisoformat(paid_at.replace('Z', '+00:00'))
			except ValueError:
				return Response(
					{'detail': 'Format paid_at invalide. Utilisez ISO 8601'},
					status=status.HTTP_400_BAD_REQUEST
				)
		else:
			paid_at = None
		
		# Generate invoice number
		from django.utils.text import slugify
		import secrets
		invoice_number = f"INV-{tenant.name.upper()}-{timezone.now().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
		
		# Check if invoice already exists
		while TenantPaymentHistory.objects.filter(invoice_number=invoice_number).exists():
			invoice_number = f"INV-{tenant.name.upper()}-{timezone.now().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
		
		try:
			payment = TenantPaymentHistory.objects.create(
				tenant=tenant,
				plan=plan,
				invoice_number=invoice_number,
				amount=amount,
				currency=tenant.plan.currency if tenant.plan else 'FCFA',
				status='paid' if paid_at else 'pending',
				month=str(month) if month else '',
				year=str(year) if year else '',
				payment_method=payment_method,
				paid_at=paid_at,
				notes=notes,
			)
			
			return Response(
				{
					'id': payment.id,
					'invoice_number': payment.invoice_number,
					'tenant_id': tenant.id,
					'church_name': tenant.church_name,
					'amount': str(payment.amount),
					'currency': payment.currency,
					'status': payment.status,
					'message': 'Facturation créée avec succès'
				},
				status=status.HTTP_201_CREATED
			)
		except Exception as e:
			return Response(
				{'detail': str(e)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


class BillingCancelView(APIView):
	"""POST: Cancel a tenant payment"""
	def post(self, request, payment_id):
		"""Cancel/refund a payment by changing status to 'refunded'"""
		payment = TenantPaymentHistory.objects.filter(id=payment_id).first()
		if not payment:
			return Response(
				{'detail': 'Paiement non trouvé'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		# Check if already refunded
		if payment.status == 'refunded':
			return Response(
				{'detail': 'Ce paiement est déjà remboursé'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		try:
			payment.status = 'refunded'
			payment.save(update_fields=['status', 'updated_at'])
			
			return Response(
				{
					'id': payment.id,
					'invoice_number': payment.invoice_number,
					'status': payment.status,
					'message': 'Paiement annulé avec succès'
				},
				status=status.HTTP_200_OK
			)
		except Exception as e:
			return Response(
				{'detail': str(e)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)
