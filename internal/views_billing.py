from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
from decimal import Decimal

from internal.permission import IsInternalAdminOrMod
from tenants.models import Tenant, TenantPaymentHistory, BillingPlan


class TenantBillingRecentView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalAdminOrMod]
    """GET: List all tenants with their most recent billing info"""
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
                    'is_active': tenant.is_active,
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
    permission_classes = []
    authentication_classes = []
    """GET: Filter billings by month and year"""
    def get(self, request):
        """
        Query params: month (1-12), year (YYYY)
        Returns: invoice_number, church_name, status, amount, currency, month, year, paid_at, payment_method, plan
        """
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        print(month, year)
        
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
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
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
        plan = request.data.get('plan')
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
        if plan:
            plan = BillingPlan.objects.filter(pk=plan).first()
        
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


class ChangeBillingPlanView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    """POST: Change a tenant's billing plan"""
    def post(self, request):
        """
        Request body:
        {
            "tenant_id": 1,
            "plan_id": 2
        }
        """
        tenant_id = request.data.get('tenant_id')
        plan_id = request.data.get('plan_id')

        if not tenant_id or not plan_id:
            return Response({'detail': 'tenant_id et plan_id sont requis'}, status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Locataire non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        plan = BillingPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response({'detail': 'Plan non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        try:
            tenant.plan = plan
            tenant.save()
            return Response({'detail': 'Plan mis à jour', 'plan': plan.code}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class BillingStatsView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    """GET: Get billing statistics (monthly revenue, annual revenue, active/inactive tenants)"""
    def get(self, request):
        """
        Returns billing statistics:
        - monthly_revenue: sum of active tenants' monthly billing amounts
        - annual_revenue: projected annual revenue
        - active_tenants_count: number of active tenants
        - inactive_tenants_count: number of inactive tenants
        
        Calculation:
        - Monthly revenue: 
          - For monthly cycle: sum of plan.price
          - For annual cycle: sum of (plan.annual_price / 12)
        - Annual revenue:
          - For monthly cycle: sum of (plan.price * 12)
          - For annual cycle: sum of plan.annual_price
        """
        try:
            active_tenants = Tenant.objects.select_related('plan').filter(is_active=True)
            inactive_tenants = Tenant.objects.filter(is_active=False)
            
            monthly_revenue = Decimal('0')
            annual_revenue = Decimal('0')
            
            for tenant in active_tenants:
                if not tenant.plan:
                    continue
                
                plan_price = Decimal(str(tenant.plan.price)) if tenant.plan.price else Decimal('0')
                annual_price = Decimal(str(tenant.plan.annual_price)) if tenant.plan.annual_price else Decimal('0')
                
                if tenant.billing_cycle == 'monthly':
                    # Monthly cycle: add price to monthly, multiply by 12 for annual
                    monthly_revenue += plan_price
                    annual_revenue += plan_price * 12
                elif tenant.billing_cycle == 'yearly':
                    # Annual cycle: divide annual_price by 12 for monthly, add full to annual
                    if annual_price > 0:
                        monthly_revenue += annual_price / 12
                        annual_revenue += annual_price
                # 'custom' cycle: skip revenue calculations
            
            return Response({
                'monthly_revenue': str(monthly_revenue),
                'annual_revenue': str(annual_revenue),
                'active_tenants_count': active_tenants.count(),
                'inactive_tenants_count': inactive_tenants.count(),
                'currency': 'FCFA',  # Default currency
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
