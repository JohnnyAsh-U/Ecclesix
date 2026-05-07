from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from django.db import connection
from django_tenants.utils import schema_context

from church.models import Church
from tenants.models import Tenant
from internal.permission import IsInternalAdminOrMod
from multimedia.models import MediaFile



class TenantStorageListView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    """GET: List tenants with aggregated storage info from each tenant schema"""
    def get(self, request):
        try:
            tenants = Tenant.objects.exclude(schema_name='public').values('id', 'schema_name', 'name', 'church_name')
            result = []
            for t in tenants:
                schema = t['schema_name']
                try:
                    with schema_context(schema):
                        totals = MediaFile.objects.aggregate(
                            total_files_count=Count('id'),
                            total_files_size=Sum('file_size')
                        )
                        total_count = totals['total_files_count'] or 0
                        total_size = totals['total_files_size'] or 0

                    result.append({
                        'tenant_id': t['id'],
                        'schema_name': schema,
                        'name': t['church_name'],
                        'total_files_count': total_count,
                        'total_files_size': total_size,
                        'total_files_size_mb': round(total_size / (1024 * 1024), 2),
                        'total_files_size_gb': round(total_size / (1024 * 1024 * 1024), 2),
                    })
                except Exception as e:
                    result.append({
                        'tenant_id': t['id'],
                        'schema_name': schema,
                        'name': t['church_name'],
                        'error': str(e),
                    })

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AllTenantsStorageTotalsView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    """GET: Aggregate total files size, total file count, and breakdown by media type across all tenants"""
    def get(self, request):
        try:
            tenants = Tenant.objects.exclude(schema_name='public').values('id', 'schema_name', 'name')

            total_files_count = 0
            total_files_size = 0
            breakdown = {}  # media_type -> {'count': int, 'size': int}

            for t in tenants:
                schema = t['schema_name']
                try:
                    with schema_context(schema):
                        totals = MediaFile.objects.aggregate(
                            total_files_count=Count('id'),
                            total_files_size=Sum('file_size')
                        )

                        total_files_count += totals.get('total_files_count') or 0
                        total_files_size += totals.get('total_files_size') or 0

                        by_type = MediaFile.objects.values('media_type').annotate(
                            count=Count('id'),
                            size=Sum('file_size')
                        )

                        for item in by_type:
                            mt = item.get('media_type') or 'unknown'
                            if mt not in breakdown:
                                breakdown[mt] = {'count': 0, 'size': 0}
                            breakdown[mt]['count'] += item.get('count') or 0
                            breakdown[mt]['size'] += item.get('size') or 0
                except Exception:
                    # Skip tenant on error but continue aggregating others
                    continue

            breakdown_list = []
            for mt, vals in breakdown.items():
                size = vals['size'] or 0
                breakdown_list.append({
                    'media_type': mt,
                    'count': vals['count'] or 0,
                    'size': size,
                    'size_mb': round(size / (1024 * 1024), 2),
                    'size_gb': round(size / (1024 * 1024 * 1024), 2),
                })

            return Response({
                'summary': {
                    'total_files_count': total_files_count,
                    'total_files_size': total_files_size,
                    'total_files_size_mb': round(total_files_size / (1024 * 1024), 2),
                    'total_files_size_gb': round(total_files_size / (1024 * 1024 * 1024), 2),
                },
                'breakdown_by_type': breakdown_list,
            })
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
