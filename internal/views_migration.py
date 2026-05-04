# internal/views/migrations.py
import subprocess
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
from django_tenants.utils import get_tenant_model

@csrf_exempt
@require_POST
def run_tenant_migration(request, schema_name):
    """FastAPI calls this to trigger migration for one tenant."""
    try:
        result = subprocess.run(
            ['python', 'manage.py', 'migrate_schemas', f'--schema={schema_name}'],
            capture_output=True,
            text=True,
            timeout=120,
            cwd='/app'  # your django project root
        )
        success = result.returncode == 0
        return JsonResponse({
            'schema_name': schema_name,
            'success': success,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
        })
    except subprocess.TimeoutExpired:
        return JsonResponse({
            'schema_name': schema_name,
            'success': False,
            'error': 'Migration timed out after 120s'
        }, status=500)
    except Exception as e:
        return JsonResponse({
            'schema_name': schema_name,
            'success': False,
            'error': str(e)
        }, status=500)


@require_GET
def tenant_migration_state(request, schema_name):
    """Returns current migration versions for a tenant schema."""
    from django.db import connection

    with connection.cursor() as cursor:
        # Switch to that tenant's schema
        cursor.execute(f'SET search_path TO {schema_name}')
        cursor.execute('''
            SELECT app, name, applied
            FROM django_migrations
            ORDER BY applied DESC
        ''')
        rows = cursor.fetchall()
        # Reset to public
        cursor.execute('SET search_path TO public')

    migrations = [
        {'app': r[0], 'name': r[1], 'applied_at': r[2].isoformat()}
        for r in rows
    ]
    return JsonResponse({
        'schema_name': schema_name,
        'migration_count': len(migrations),
        'latest': migrations[0] if migrations else None,
        'all': migrations,
    })


@require_GET
def all_tenants_migration_summary(request):
    """Returns migration state for every tenant — FastAPI calls this on dashboard load."""
    from django.db import connection
    TenantModel = get_tenant_model()
    tenants = TenantModel.objects.exclude(schema_name='public').values('schema_name', 'name')

    summary = []
    with connection.cursor() as cursor:
        for tenant in tenants:
            schema = tenant['schema_name']
            try:
                cursor.execute(f'SET search_path TO {schema}')
                cursor.execute('''
                    SELECT name, applied FROM django_migrations
                    ORDER BY applied DESC LIMIT 1
                ''')
                row = cursor.fetchone()
                cursor.execute('SET search_path TO public')
                summary.append({
                    'schema_name': schema,
                    'name': tenant['name'],
                    'latest_migration': row[0] if row else None,
                    'latest_applied_at': row[1].isoformat() if row else None,
                })
            except Exception as e:
                summary.append({
                    'schema_name': schema,
                    'name': tenant['name'],
                    'error': str(e),
                })

    return JsonResponse({'tenants': summary})