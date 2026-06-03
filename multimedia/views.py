import json
from pathlib import Path
from os import path
import uuid
from django.db import connection
from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404, redirect
from django.http import FileResponse

from backend import settings
from multimedia.tasks import scan_uploaded_media
from .services.s3 import s3_client
from backend.settings import UPLOAD_POLICIES

from .models import MediaFile
from .serializers import CreateUploadMediaFileSerializer, MediaFileSerializer
from event.models import Event
from members.models import Member
from django.db.models import Q, Sum, Count
from rest_framework.pagination import PageNumberPagination
from .services import s3


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
        "POST": ["ajouter_mediafile"],
    }

    def create(self, request, *args, **kwargs):
        # permission: require ajouter_mediafile or superuser
        user = request.user
        if not user.is_superuser and not getattr(user, 'has_perm_custom', lambda p: False)('ajouter_mediafile'):
            return Response(status=status.HTTP_403_FORBIDDEN)

        files = request.FILES.getlist('file')
        if not files:
            return Response({'detail': 'No file(s) provided'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.POST.get('title', '')

        # determine church: prefer provided church (only superusers), otherwise user's church
        church_id = None
        provided_church = request.POST.get('church')
        if provided_church:
            try:
                cid = int(provided_church)
            except Exception:
                cid = None
            if cid is not None:
                if not user.is_superuser:
                    return Response(status=status.HTTP_403_FORBIDDEN)
                church_id = cid

        if church_id is None:
            church_id = getattr(user, 'church_id', None)

        member = _get_member_for_user(user)

        created = []
        for f in files:
            # infer media type from content_type
            ctype = getattr(f, 'content_type', '') or ''
            if ctype.startswith('image/'):
                mtype = 'image'
            elif ctype.startswith('video/'):
                mtype = 'video'
            elif ctype.startswith('audio/'):
                mtype = 'audio'
            else:
                mtype = 'document'

            mf = MediaFile(
                church_id=church_id,
                media_type=mtype,
                file=f,
                title=title,
                uploaded_by=member
            )
            mf.save()
            created.append(MediaFileSerializer(mf, context={'request': request}).data)

        return Response({'created': created}, status=status.HTTP_201_CREATED)

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
        
        # Compute stats once with a single aggregation query (combines 5 queries into 1)
        stats_data = queryset.aggregate(
            total_size=Sum('file_size'),
            total=Count('id'),
            videos=Count('id', filter=Q(media_type='video')),
            audios=Count('id', filter=Q(media_type='audio')),
            photos=Count('id', filter=Q(media_type='image')),
            documents=Count('id', filter=Q(media_type='document')),
        )
        
        stats = {
            'total': stats_data['total'] or 0,
            'videos': stats_data['videos'] or 0,
            'audios': stats_data['audios'] or 0,
            'photos': stats_data['photos'] or 0,
            'documents': stats_data['documents'] or 0,
            'total_size': int(stats_data['total_size'] or 0),
        }
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            response = self.get_paginated_response(data)
            response.data['stats'] = stats
            return response
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        
        return Response({'results': serializer.data, 'stats': stats})


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
    
    
    

class CreateUploadMediaFileView(APIView):
    
    
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["ajouter_mediafile"],
    }
    
    
    def post(self, request):
        # permission: require ajouter_mediafile or superuser
        user = request.user
        if not user.is_superuser and not getattr(user, 'has_perm_custom', lambda p: False)('ajouter_mediafile'):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = CreateUploadMediaFileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        print(data)
        filename = data['filename']
        mimetype = data['mimetype']
        size = data['filesize']
        title = data.get("title", '')
        provided_church_id = data['church_id']
        
        media_type = mimetype.split('/')[0] if '/' in mimetype else 'document'
        
        policy = UPLOAD_POLICIES.get(media_type, UPLOAD_POLICIES['document'])
        
        if mimetype not in policy['allowed_types']:
            return Response(
                {'detail': f"File type {mimetype} is not allowed for {media_type}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if size > policy['max_size']:
            return Response(
                {'detail': f"File size exceeds the maximum allowed for {media_type} ({policy['max_size']} bytes)"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        ext = Path(filename).suffix.lower()
        schema = connection.schema_name
        
        # determine church: prefer provided church (only superusers), otherwise user's church
        church_id = None
        if provided_church_id:
            try:
                cid = int(provided_church_id)
            except Exception:
                cid = None
            if cid is not None:
                if not user.is_superuser:
                    return Response(status=status.HTTP_403_FORBIDDEN)
                church_id = cid

        if church_id is None:
            church_id = getattr(user, 'church_id', None)

        
        key = (f"medias/{schema}/{filename}" )
        
        media = MediaFile.objects.create(
            church_id = church_id,
            media_type=media_type,
            object_key=key,
            title=title,
            uploaded_by=_get_member_for_user(user),
            file_size=size,
        )
        
        upload_url = s3.generate_presigned_upload_url(
            object_key=key,
            content_type=mimetype
        )
        
        return Response({
            "upload_id": str(media.id),
            "upload_url": upload_url,
            "key": key
        })
        

class CompleteUploadView(APIView):
    
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["ajouter_mediafile"],
    }
    
    
    def post(self, request, upload_id):
        media = MediaFile.objects.get(
            id= upload_id,
            uploaded_by = request.user
        )
        
        try:
            metadata = s3_client.head_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=media.object_key
            )
        except Exception:
            return Response({"error": "upload missing"}, status=status.HTTP_400_BAD_REQUEST)
        
        actual_size = metadata["ContentLength"]
        if actual_size != media.file_size:
            media.status = MediaFile.Status.REJECTED
            media.scan_result = "size mismatch"
            media.save()
            return Response({"error": "size mismatch"}, status=status.HTTP_400_BAD_REQUEST)
        
        media.status = MediaFile.Status.READY
        media.file.name = media.object_key.split("/")[-1]
        media.save(update_fields=["status", "file"])
        
        # scan_uploaded_media.send(str(media.id))

        return Response({'created': "Created"}, status=status.HTTP_201_CREATED)
