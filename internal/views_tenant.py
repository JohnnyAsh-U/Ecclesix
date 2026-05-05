from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from .permission import IsInternalAdmin, IsInternalAdminOrMod
from tenants.models import Tenant, TenantPaymentHistory, TenantStorageQuota, TenantDomain, BillingPlan
from members.models import Member
from django_tenants.utils import schema_context
from django.db import connection

from .serializers import TenantCreateSerializer
from .services import send_welcome_email


class TenantListCreateView(APIView):
    authentication_classes = []  # Add authentication classes as needed
    permission_classes = [IsInternalAdminOrMod]  # Add permission classes as needed
    
    
    """GET: List all tenants; POST: Create a new tenant"""
    def get(self, request):
        tenants = Tenant.objects.select_related('plan').all()
        data = []
        for t in tenants:
            domains = list(TenantDomain.objects.filter(tenant=t).values_list('domain', flat=True))
            storage = None
            try:
                quota = TenantStorageQuota.objects.filter(tenant=t).first()
                if quota:
                    storage = {
                        'quota_bytes': quota.quota_bytes,
                        'used_bytes': quota.used_bytes,
                        'percent': round((quota.used_bytes / quota.quota_bytes) * 100, 2) if quota.quota_bytes else None,
                    }
            except Exception:
                storage = None

            data.append(
                {
                    'id': t.id,
                    'church_name': t.church_name,
                    'domains': domains or [],
                    'plan': t.plan.code if t.plan else None,
                    'is_active': t.is_active,
                    'church_count': t.church_count,
                    'member_count': t.member_count,
                    'storage': storage,
                }
            )

        return Response(data)

    def post(self, request):
        """
        Create a new tenant with full lifecycle automation:
        1. Create schema
        2. Run migrations for tenant
        3. Create superuser with random password
        4. Send welcome email
        """
        serializer = TenantCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        name = data.get('name', 'name')
        church_name = data.get('church_name')
        domain_str = data.get('domain')
        superadmin_email = data.get('superadmin_email')
        schema_name = data.get('schema_name', '')
        plan_code = data.get('plan_code', '')
        billing_cycle = data.get('billing_cycle', 'monthly')
        email = data.get('email', '')
        phone = data.get('phone', '')
        

        try:
            # Get plan if provided
            plan = None
            if plan_code:
                plan = BillingPlan.objects.filter(code=plan_code).first()

            # Check if schema already exists
            if Tenant.objects.filter(schema_name=schema_name).exists():
                return Response(
                    {'detail': f'Un locataire avec le nom de schéma {schema_name} existe déjà.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Tenant instance (this will auto-create the schema with auto_create_schema=True)
            tenant = Tenant(
                name=name,
                church_name=church_name,
                email=email,
                phone=phone,
                plan=plan,
                billing_cycle=billing_cycle,
                logo=None,
                custom_logo=False,
                schema_name=schema_name,
            )
            tenant.save()
                        
            domain = TenantDomain()
            domain.domain = domain_str
            domain.tenant = tenant
            domain.is_primary = True
            domain.save()
            
            
            # Create the StorageQuota for the tenant
            quota = TenantStorageQuota()
            quota.tenant = tenant
            quota.used_bytes = 0
            quota.save()

            # Run migrations for the new tenant schema
            with schema_context(schema_name):
                # Generate random password
                password_chars = string.ascii_letters + string.digits + '!@#$%^&*'
                password = ''.join(secrets.choice(password_chars) for _ in range(16))

                # Create superuser for the tenant
                try:
                    superuser = Member.objects.create_superuser(
                        email=superadmin_email,
                        password=password,
                        first_name='Super',
                        last_name='Admin'
                    )
                except Exception as e:
                    # Clean up on superuser creation failure
                    tenant.delete()
                    return Response(
                        {'detail': f'Échec de la création du superuser: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Send welcome email (outside schema context, using public schema)
            email_sent = send_welcome_email(superadmin_email, church_name, password, domain_str)

            response_data = {
                'id': tenant.id,
                'church_name': tenant.church_name,
                'domains': [domain_str],
                'schema_name': tenant.schema_name,
                'plan': plan.code if plan else None,
                'is_active': tenant.is_active,
                'superadmin_email': superadmin_email,
                'email_sent': email_sent,
                'message': 'Client créé avec succès. Un email de bienvenue a été envoyé au superadmin.'
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'detail': f'Une erreur s\'est produite: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                     )


class TenantDetailView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalAdminOrMod]
    def get(self, request, tenant_id):
        tenant = Tenant.objects.select_related('plan').filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        domains = list(TenantDomain.objects.filter(tenant=tenant).values_list('domain', flat=True))
        storage = None
        quota = TenantStorageQuota.objects.filter(tenant=tenant).first()
        if quota:
            storage = {
                'quota_bytes': quota.quota_bytes,
                'used_bytes': quota.used_bytes,
                'percent': round((quota.used_bytes / quota.quota_bytes) * 100, 2) if quota.quota_bytes else None,
            }

        six_months_ago = timezone.now() - timedelta(days=180)
        payments = TenantPaymentHistory.objects.filter(tenant=tenant, paid_at__gte=six_months_ago).order_by('-paid_at')
        payments_data = [
            {
                'invoice_number': p.invoice_number,
                'amount': str(p.amount),
                'currency': p.currency,
                'status': p.status,
                'paid_at': p.paid_at,
            }
            for p in payments
        ]

        data = {
            'id': tenant.id,
            'church_name': tenant.church_name,
            'domains': domains or [tenant.domain],
            'plan': tenant.plan.code if tenant.plan else None,
            'is_active': tenant.is_active,
            'church_count': tenant.church_count,
            'member_count': tenant.member_count,
            'storage': storage,
            'payment_history_last_6_months': payments_data,
        }

        return Response(data)


class TenantActivateView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request, tenant_id):
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        tenant.is_active = True
        tenant.save(update_fields=['is_active', 'updated_at'])
        return Response({'detail': 'Activé'})


class TenantDeactivateView(APIView):
    authentication_classes = []
    permission_classes  = []
    def post(self, request, tenant_id):
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        tenant.is_active = False
        tenant.save(update_fields=['is_active', 'updated_at'])
        return Response({'detail': 'Désactivé'})


class TenantDomainsView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalAdminOrMod]
    
    
    """GET: List domains; POST: Add domain; DELETE: Remove domain"""
    def get(self, request, tenant_id):
        """List all domains for a tenant"""
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        domains = TenantDomain.objects.filter(tenant=tenant).values('id', 'domain', 'is_active', 'created_at')
        return Response(list(domains))

    def post(self, request, tenant_id):
        """Add a new domain to a tenant"""
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        domain = request.data.get('domain', '').strip().lower()
        if not domain:
            return Response({'detail': 'Le domaine est requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate domain format
        from tenants.models import domain_validator
        try:
            domain_validator(domain)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if domain already exists for any tenant
        if TenantDomain.objects.filter(domain=domain).exists():
            return Response({'detail': 'Le domaine existe déjà'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tenant_domain = TenantDomain.objects.create(
                tenant=tenant,
                domain=domain,
                is_active=True
            )
            return Response(
                {'id': tenant_domain.id, 'domain': tenant_domain.domain, 'is_active': tenant_domain.is_active},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, tenant_id):
        """Remove a domain from a tenant"""
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        domain = request.data.get('domain', '').strip().lower()
        if not domain:
            return Response({'detail': 'Le domaine est requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant_domain = TenantDomain.objects.filter(tenant=tenant, domain=domain).first()
        if not tenant_domain:
            return Response({'detail': 'Domaine non trouvé pour ce locataire'}, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent deletion if it's the only domain
        if TenantDomain.objects.filter(tenant=tenant).count() == 1:
            return Response({'detail': 'Impossible de supprimer le dernier domaine'}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant_domain.delete()
        return Response({'detail': 'Domaine supprimé'}, status=status.HTTP_200_OK)



