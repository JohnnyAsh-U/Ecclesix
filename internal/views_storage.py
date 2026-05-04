from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from django.db import connection
from django_tenants.utils import schema_context

from church.models import Church
from multimedia.models import MediaFile


class ChurchStorageListView(APIView):
    permission_classes = []
    authentication_classes = []
    """GET: List all churches with their file counts and total file sizes"""
    def get(self, request):
        """Returns list of all churches with storage information"""
        try:
            current_schema = connection.schema_name
            
            churches = Church.objects.annotate(
                files_count=Count('media_files', filter=Q(media_files__isnull=False)),
                total_files_size=Sum('media_files__file_size', filter=Q(media_files__isnull=False))
            ).order_by('-total_files_size')

            data = []
            for church in churches:
                data.append({
                    'id': church.id,
                    'church_name': church.church_name,
                    'address': church.address,
                    'files_count': church.files_count or 0,
                    'total_files_size': church.total_files_size or 0,
                    'total_files_size_mb': round((church.total_files_size or 0) / (1024 * 1024), 2),
                    'total_files_size_gb': round((church.total_files_size or 0) / (1024 * 1024 * 1024), 2),
                })

            return Response({
                'tenant_schema': current_schema,
                'churches': data,
                'total_churches': len(data),
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors de la récupération des églises: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StorageSummaryView(APIView):
    permission_classes = []
    authentication_classes = []
    """GET: Get total file count and total storage size across all churches"""
    def get(self, request):
        """Returns total storage summary for the current tenant"""
        try:
            current_schema = connection.schema_name
            
            # Get all media files and calculate totals
            totals = MediaFile.objects.aggregate(
                total_files_count=Count('id'),
                total_files_size=Sum('file_size')
            )

            total_count = totals['total_files_count'] or 0
            total_size = totals['total_files_size'] or 0

            # Get breakdown by media type
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

            # Get breakdown by church
            breakdown_by_church = Church.objects.annotate(
                files_count=Count('media_files'),
                total_size=Sum('media_files__file_size')
            ).filter(files_count__gt=0).order_by('-total_size').values(
                'id', 'church_name', 'files_count', 'total_size'
            )

            church_breakdown = []
            for church in breakdown_by_church:
                church_breakdown.append({
                    'church_id': church['id'],
                    'church_name': church['church_name'],
                    'files_count': church['files_count'] or 0,
                    'total_size': church['total_size'] or 0,
                    'total_size_mb': round((church['total_size'] or 0) / (1024 * 1024), 2),
                })

            return Response({
                'tenant_schema': current_schema,
                'summary': {
                    'total_files_count': total_count,
                    'total_files_size': total_size,
                    'total_files_size_mb': round(total_size / (1024 * 1024), 2),
                    'total_files_size_gb': round(total_size / (1024 * 1024 * 1024), 2),
                },
                'breakdown_by_type': type_breakdown,
                'breakdown_by_church': church_breakdown,
            })
        except Exception as e:
            return Response(
                {'detail': f'Erreur lors du calcul du résumé du stockage: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
