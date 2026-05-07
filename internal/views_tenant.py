from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from church.models import Church
from multimedia.models import MediaFile

from .permission import IsInternalAdmin, IsInternalAdminOrMod
from tenants.models import Tenant, TenantPaymentHistory, TenantStorageQuota, TenantDomain, BillingPlan
from members.models import Member
from django_tenants.utils import schema_context
from django.db import connection, transaction

from .serializers import TenantCreateSerializer
from .services import send_welcome_email
from rest_framework import status
from django.db.models import Count, Sum, Q




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
                    'name': t.name,
                    'church_name': t.church_name,
                    'domains': domains or [],
                    'plan': t.plan.code if t.plan else None,
                    'email': t.email,
                    'phone': t.phone,
                    'custom_logo': t.custom_logo,
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
        plan = data.get('plan', '')
        billing_cycle = data.get('billing_cycle', 'monthly')
        email = data.get('email', '')
        phone = data.get('phone', '')

        tenant = None
        password = None
        try:           
            # Check if schema already exists
            if Tenant.objects.filter(schema_name=schema_name).exists():
                return Response(
                    {'detail': f'Un locataire avec le nom de schéma {schema_name} existe déjà.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Wrap public-schema writes in an atomic block. Note: schema creation (DDL)
            # may not be fully rollbackable, so we also perform explicit cleanup on failures.
            with transaction.atomic():
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
                
                # Create billing for current month if plan is provided
                if plan:
                    amount = plan.price if billing_cycle == 'monthly' else plan.annual_price
                    billing = TenantPaymentHistory.objects.create(
                        tenant=tenant,
                        invoice_number=f"INV-{tenant.id}-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                        amount=amount,
                        month=timezone.now().month,
                        year=timezone.now().year,
                        plan=plan,
                        currency=plan.currency,
                        status='paid',
                    )

            # Create superuser inside the tenant schema
            try:
                with schema_context(schema_name):
                    # Generate random password
                    password_chars = string.ascii_letters + string.digits + '!@#$%^&*'
                    password = ''.join(secrets.choice(password_chars) for _ in range(16))

                    superuser = Member.objects.create_superuser(
                        email=superadmin_email,
                        password=password,
                        first_name='Super',
                        last_name='Admin'
                    )
            except Exception as e:
                # Attempt to clean up tenant and related resources. Close DB connections
                # to release any locks before deleting schema.
                try:
                    connection.close()
                except Exception:
                    pass
                if tenant:
                    try:
                        billing.delete() if billing else None
                        domain.delete() if domain else None
                        quota.delete() if quota else None
                        tenant.delete()
                    except Exception:
                        pass
                return Response(
                    {'detail': f"Échec de la création du superuser: {str(e)}"},
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
            # Final catch-all: ensure partial resources are removed for consistency.
            try:
                connection.close()
            except Exception:
                pass
            if tenant:
                try:
                    billing.delete() if billing else None
                    domain.delete() if domain else None
                    quota.delete() if quota else None
                    tenant.delete()
                except Exception:
                    pass
            return Response(
                {'detail': f"Une erreur s'est produite: {str(e)}"},
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
    
    def put(self, request, tenant_id):
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response(
                {'detail': 'Not Found Tenant'},
                status=status.HTTP_404_NOT_FOUND
            )
        name = request.data.get('name', tenant.name)
        church_name = request.data.get('church_name', tenant.church_name)
        phone = request.data.get('phone', tenant.phone)
        email = request.data.get('email', tenant.email)
        custom_logo = request.data.get('custom_logo', tenant.custom_logo)
        
        if church_name != tenant.church_name and Tenant.objects.filter(church_name=church_name).exists():
            return Response(
                {'detail': f'Church name exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        tenant.name = name
        tenant.church_name = church_name
        tenant.phone = phone
        tenant.email = email
        tenant.custom_logo = custom_logo
        tenant.save()
        
        return Response({
            'id': tenant.id,
            'name': tenant.name,
            'phone': tenant.phone,
            'email': tenant.email,
            'church_name': tenant.church_name,
            'is_active': tenant.is_active,
            'church_count': tenant.church_count,
            'member_count': tenant.member_count,
        })


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

    def patch(self, request, tenant_id):
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
        
        primary_domain = TenantDomain.objects.first()
        # Check if domain already exists for any tenant
        if primary_domain:
            primary_domain.domain = domain
            primary_domain.save()
            
            return Response(
                {'id': primary_domain.id, 'domain': primary_domain.domain, 'is_active': primary_domain.is_active},
                status=status.HTTP_201_CREATED
            )
        else:
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


class TenantStorageView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalAdminOrMod]
    
    
    def get(self, request, tenant_id):
        """Returns total storage summary for the specified tenant (query param `tenant_id`) or current schema."""
        try:
            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=int(tenant_id))
                except Tenant.DoesNotExist:
                    return Response({'detail': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

                # run aggregations inside tenant schema
                with schema_context(tenant.schema_name):
                    totals = MediaFile.objects.aggregate(
                        total_files_count=Count('id'),
                        total_files_size=Sum('file_size')
                    )

                    total_count = totals['total_files_count'] or 0
                    total_size = totals['total_files_size'] or 0

                    breakdown_by_type = MediaFile.objects.values('media_type').annotate(
                        count=Count('id'),
                        size=Sum('file_size')
                    ).order_by('-size')

                    type_breakdown = []
                    for item in breakdown_by_type:
                        type_breakdown.append({
                            'media_type': item['media_type'],
                            'count': item['count'] or 0,
                            'size': item['size'] or 0,
                            'size_mb': round((item['size'] or 0) / (1024 * 1024), 2),
                        })
                    # breakdown by church (aggregate per church inside tenant schema)
                    churches = Church.objects.annotate(
                        files_count=Count('media_files', filter=Q(media_files__isnull=False)),
                        total_files_size=Sum('media_files__file_size', filter=Q(media_files__isnull=False))
                    ).order_by('-total_files_size')

                    church_breakdown = []
                    for church in churches:
                        church_breakdown.append({
                            'id': church.id,
                            'church_name': church.church_name,
                            'address': getattr(church, 'address', None),
                            'files_count': church.files_count or 0,
                            'total_files_size': church.total_files_size or 0,
                            'total_files_size_mb': round((church.total_files_size or 0) / (1024 * 1024), 2),
                            'total_files_size_gb': round((church.total_files_size or 0) / (1024 * 1024 * 1024), 2),
                        })

                    return Response({
                        'tenant_schema': tenant.schema_name,
                        'tenant_id': tenant.id,
                        'summary': {
                            'total_files_count': total_count,
                            'total_files_size': total_size,
                            'total_files_size_mb': round(total_size / (1024 * 1024), 2),
                            'total_files_size_gb': round(total_size / (1024 * 1024 * 1024), 2),
                        },
                        'breakdown_by_type': type_breakdown,
                        'breakdown_by_church': church_breakdown,  # Optional: implement if needed
                    })
            else:
                return Response({
                    'detail': 'tenant_id query parameter is required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(e)
            return Response(
                {'detail': f'Erreur lors du calcul du résumé du stockage: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def patch(self, request, tenant_id):
        """Update storage quota for a tenant"""
        tenant = Tenant.objects.filter(id=tenant_id).first()
        if not tenant:
            return Response({'detail': 'Non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        quota = TenantStorageQuota.objects.filter(tenant=tenant).first()
        if not quota:
            return Response({'detail': 'Quota de stockage non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        quota_bytes = request.data.get('quota_bytes')
        if quota_bytes is None:
            return Response({'detail': 'quota_bytes est requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quota_bytes = int(quota_bytes)
            if quota_bytes <= 0:
                return Response({'detail': 'quota_bytes doit être positif'}, status=status.HTTP_400_BAD_REQUEST)

            quota.quota_bytes = quota_bytes
            quota.save(update_fields=['quota_bytes'])

            return Response({
                'quota_bytes': quota.quota_bytes,
                'used_bytes': quota.used_bytes,
                'percent': round((quota.used_bytes / quota.quota_bytes) * 100, 2) if quota.quota_bytes else None,
            })
        except (ValueError, TypeError):
            return Response({'detail': 'quota_bytes doit être un entier valide'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



