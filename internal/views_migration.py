# internal/views/migrations.py
from django.core.management import call_command
import io
import contextlib
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django_tenants.utils import get_tenant_model
from .permission import IsInternalAdminOrMod
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([IsInternalAdminOrMod])
def run_tenant_migration(request, tenant_id):
    """FastAPI calls this to trigger migration for one tenant (by tenant_id)."""
    TenantModel = get_tenant_model()
    try:
        tenant = TenantModel.objects.get(id=tenant_id)
    except TenantModel.DoesNotExist:
        return JsonResponse({'tenant_id': tenant_id, 'success': False, 'error': 'Tenant not found'}, status=404)

    schema_name = getattr(tenant, 'schema_name', None)
    if not schema_name:
        return JsonResponse({'tenant_id': tenant_id, 'success': False, 'error': 'Tenant has no schema_name'}, status=400)

    try:
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            # call_command will run the migrate_schemas management command for the tenant schema
            call_command('migrate_schemas', schema_name=schema_name, interactive=False)
        output = buf.getvalue()
        return Response({
            'schema_name': schema_name,
            'tenant_id': tenant_id,
            'success': True,
            'stdout': output,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'schema_name': schema_name,
            'tenant_id': tenant_id,
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([IsInternalAdminOrMod])
def tenant_migration_state(request, tenant_id):
    """Returns current migration versions for a tenant schema, resolved by tenant_id."""
    from django.db import connection
    TenantModel = get_tenant_model()
    try:
        tenant = TenantModel.objects.get(id=tenant_id)
    except TenantModel.DoesNotExist:
        return JsonResponse({'tenant_id': tenant_id, 'error': 'Tenant not found'}, status=404)

    schema_name = getattr(tenant, 'schema_name', None)
    if not schema_name:
        return JsonResponse({'tenant_id': tenant_id, 'error': 'Tenant has no schema_name'}, status=400)

    with connection.cursor() as cursor:
        try:
            cursor.execute(f'SET search_path TO {schema_name}')
            cursor.execute('''
                SELECT app, name, applied
                FROM django_migrations
                ORDER BY applied DESC
            ''')
            rows = cursor.fetchall()
            # Reset to public
            cursor.execute('SET search_path TO public')
        except Exception as e:
            try:
                cursor.execute('SET search_path TO public')
            except Exception:
                pass
            return Response({'tenant_id': tenant_id, 'schema_name': schema_name, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    migrations = [
        {'app': r[0], 'name': r[1], 'applied_at': r[2].isoformat() if r[2] else None}
        for r in rows
    ]
    return Response({
        'schema_name': schema_name,
        'tenant_id': tenant_id,
        'migration_count': len(migrations),
        'latest': migrations[0] if migrations else None,
        'all': migrations,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([IsInternalAdminOrMod])
def all_tenants_migration_summary(request):
    """Returns migration state for every tenant — FastAPI calls this on dashboard load."""
    from django.db import connection
    TenantModel = get_tenant_model()
    tenants = TenantModel.objects.exclude(schema_name='public').values('schema_name', 'name', 'id', 'church_name')

    summary = []
    
    with connection.cursor() as cursor:
        for tenant in tenants:
            
            schema = tenant['schema_name']
            try:
                cursor.execute(f'SET search_path TO {schema}')
                # total migrations count
                cursor.execute('SELECT COUNT(*) FROM django_migrations')
                count_row = cursor.fetchone()
                migration_count = count_row[0] if count_row else 0

                # latest migration info
                cursor.execute('''
                    SELECT name, applied FROM django_migrations
                    ORDER BY applied DESC LIMIT 1
                ''')
                row = cursor.fetchone()
                cursor.execute('SET search_path TO public')

                summary.append({
                    'schema_name': schema,
                    'name': tenant['church_name'] or tenant['name'],
                    'tenant_id': tenant['id'],
                    'migration_count': migration_count,
                    'latest_migration': row[0] if row else None,
                    'latest_applied_at': row[1].isoformat() if row and row[1] else None,
                })
            except Exception as e:
                summary.append({
                    'schema_name': schema,
                    'name': tenant['church_name'] or tenant['name'],
                    'tenant_id': tenant['id'],
                    'error': str(e),
                })

    return Response(summary, status=status.HTTP_200_OK)