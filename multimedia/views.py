import json
from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404, redirect
from django.http import FileResponse

from .models import MediaFile
from .serializers import MediaFileSerializer
from event.models import Event
from members.models import Member
from django.db.models import Q, Sum
from rest_framework.pagination import PageNumberPagination


def _get_member_for_user(user):
    try:
        return Member.objects.filter(pk=user.id).first()
    except Exception:
        return None


class EventMediaFilesView(ListCreateAPIView):
    """List and upload media files for an event.
    
    GET: List all media files for the event
    POST: Upload new media files with metadata
    """
    serializer_class = MediaFileSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_mediafile", "voirs_touts_mediafiles"],
        "POST": ["ajouter_mediafile"],
    }

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return MediaFile.objects.filter(event_id=event_id).order_by('-uploaded_at')

    def list(self, request, *args, **kwargs):
        event_id = self.kwargs.get('event_id')
        event = get_object_or_404(Event, pk=event_id)
        user = request.user
        
        if (
            not user.is_superuser
            and not user.has_perm_custom("voirs_touts_mediafiles")
            and user.church_id != event.church_id
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'event_id': event.id,
            'results': serializer.data
        })

    def create(self, request, *args, **kwargs):
        event_id = self.kwargs.get('event_id')
        event = get_object_or_404(Event, pk=event_id)
        
        # Check if the user is superadmin to add to all churches, otherwise default to user's church
        if not request.user.is_superuser and not event.church_id == getattr(request.user, "church_id", None):
            return Response(status=status.HTTP_403_FORBIDDEN)

        # Parse metadata
        metas = {}
        metadata_raw = request.POST.get('metadata')
        if metadata_raw:
            try:
                metadata = json.loads(metadata_raw)
                for d in metadata:
                    name = d.get('name')
                    title = d.get('title', '')
                    if name:
                        metas[name] = title
            except Exception:
                metas = {}

        # Upload files
        created = []
        zone_map = {
            'videos': 'video',
            'audios': 'audio',
            'photos': 'image',
            'docs': 'document'
        }
        member = _get_member_for_user(request.user)

        for key, media_type in zone_map.items():
            files = request.FILES.getlist(key)
            for f in files:
                title = metas.get(f.name, '')
                mf = MediaFile(
                    event=event,
                    church=event.church,
                    media_type=media_type,
                    file=f,
                    title=title,
                    uploaded_by=member
                )
                mf.save()
                created.append(
                    MediaFileSerializer(mf, context={'request': request}).data
                )

        return Response(
            {'created': created},
            status=status.HTTP_201_CREATED
        )


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200


class AllMediaFilesView(ListCreateAPIView):
    """List all media files across events with filters, sorting and pagination.

    Query params:
    - q: search string against title or file name
    - church: filter by event__church_id
    - type: media_type (audio, video, image, document)
    - sort: one of 'a-z', 'oldest', 'newest', 'size'
    - page / page_size: pagination controls
    """
    serializer_class = MediaFileSerializer
    pagination_class = StandardResultsSetPagination
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_mediafile", "voirs_touts_mediafiles"],
    }

    def get_queryset(self):
        qs = MediaFile.objects.select_related('event', 'church').all()

        # permissions: non-super users without global media permission only see their church
        user = self.request.user
        if (
            not user.is_superuser
            and not getattr(user, 'has_perm_custom', lambda p: False)('voirs_touts_mediafiles')
        ):
            user_church = getattr(user, 'church_id', None)
            if user_church is not None:
                qs = qs.filter(church_id=user_church)

        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(file__icontains=q))

        church = self.request.query_params.get('church')
        if church:
            try:
                cid = int(church)
                qs = qs.filter(church_id=cid)
            except Exception:
                pass

        mtype = self.request.query_params.get('type')
        if mtype:
            # accept either video/audio/image/document
            qs = qs.filter(media_type=mtype)

        sort = self.request.query_params.get('sort')
        if sort == 'a-z':
            qs = qs.order_by('title')
        elif sort == 'oldest':
            qs = qs.order_by('uploaded_at')
        elif sort == 'size':
            qs = qs.order_by('-file_size')
        else:
            # default newest
            qs = qs.order_by('-uploaded_at')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            # enrich each serialized item with the church name (if available)
            try:
                enriched = []
                for ser, obj in zip(data, page):
                    church_name = ''
                    ch = getattr(obj, 'church', None)
                    if ch is not None:
                        church_name = getattr(ch, 'name', None) or str(ch) or getattr(obj, 'church_id', '')
                    else:
                        church_name = getattr(obj, 'church_id', '')
                    ser['church_name'] = church_name
                    enriched.append(ser)

                # compute stats from the full filtered queryset
                try:
                    total_size = queryset.aggregate(total_size=Sum('file_size'))['total_size'] or 0
                    stats = {
                        'total': queryset.count(),
                        'videos': queryset.filter(media_type='video').count(),
                        'audios': queryset.filter(media_type='audio').count(),
                        'photos': queryset.filter(media_type='image').count(),
                        'documents': queryset.filter(media_type='document').count(),
                        'total_size': int(total_size),
                    }
                except Exception:
                    stats = {}

                response = self.get_paginated_response(enriched)
                # attach stats to the paginated response payload
                response.data['stats'] = stats
                return response
            except Exception:
                return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        data = serializer.data
        # try to add church_name for non-paginated responses as well
        try:
            enriched = []
            for ser, obj in zip(data, queryset):
                church_name = ''
                ch = getattr(obj, 'church', None)
                if ch is not None:
                    church_name = getattr(ch, 'name', None) or str(ch) or getattr(obj, 'church_id', '')
                else:
                    church_name = getattr(obj, 'church_id', '')
                ser['church_name'] = church_name
                enriched.append(ser)

            try:
                total_size = queryset.aggregate(total_size=Sum('file_size'))['total_size'] or 0
                stats = {
                    'total': queryset.count(),
                    'videos': queryset.filter(media_type='video').count(),
                    'audios': queryset.filter(media_type='audio').count(),
                    'photos': queryset.filter(media_type='image').count(),
                    'documents': queryset.filter(media_type='document').count(),
                    'total_size': int(total_size),
                }
            except Exception:
                stats = {}

            return Response({'results': enriched, 'stats': stats})
        except Exception:
            return Response({'results': data})


class MediaFileDetailView(RetrieveDestroyAPIView):
    """Retrieve or delete a media file."""
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_mediafile", "voirs_touts_mediafiles"],
        "DELETE": ["supprimer_mediafile"],
    }

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.file:
            instance.file.delete(save=False)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MediaFileDownloadView(APIView):
    """Download a media file (redirect to storage URL or stream)."""

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_mediafile", "voirs_touts_mediafiles"],
    }
    
    
    def get(self, request, pk):
        mf = get_object_or_404(MediaFile, pk=pk)
        # Check if user is superadmin or has permission to view all media files, otherwise check church association
        if (
            not request.user.is_superuser
            and not request.user.has_perm_custom("voirs_touts_mediafiles")
            and mf.church_id != getattr(request.user, "church_id", None)
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
       
        try:
            f = mf.file.open('rb')
            return FileResponse(
                f,
                as_attachment=True,
                filename=mf.file.name
            )
        except Exception:
            return Response(
                {'detail': 'Unable to serve file'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MediaFileShareView(APIView):
    """Get shareable URL for a media file."""
    
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_mediafile", "voirs_touts_mediafiles"],
    }

    def get(self, request, pk):
        mf = get_object_or_404(MediaFile, pk=pk)
        
        # Check if user is superadmin or has permission to view all media files, otherwise check church association
        if (
            not request.user.is_superuser
            and not request.user.has_perm_custom("voirs_touts_mediafiles")
            and mf.church_id != getattr(request.user, "church_id", None)
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        url = (
            request.build_absolute_uri(mf.file.url)
            if mf.file
            else ''
        )
        return Response({'url': url})
