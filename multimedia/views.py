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
from .permissions import CanManageMedia
from event.models import Event
from members.models import Member


def _get_member_for_user(user):
    try:
        return Member.objects.filter(user=user).first()
    except Exception:
        return None


class EventMediaFilesView(ListCreateAPIView):
    """List and upload media files for an event.
    
    GET: List all media files for the event
    POST: Upload new media files with metadata
    """
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated, CanManageMedia]
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
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'event_id': event.id,
            'results': serializer.data
        })

    def create(self, request, *args, **kwargs):
        event_id = self.kwargs.get('event_id')
        event = get_object_or_404(Event, pk=event_id)

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


class MediaFileDetailView(RetrieveDestroyAPIView):
    """Retrieve or delete a media file."""
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated, CanManageMedia]
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
    permission_classes = [IsAuthenticated, CanManageMedia]

    def get(self, request, pk):
        mf = get_object_or_404(MediaFile, pk=pk)
        self.check_object_permissions(request, mf)
        
        try:
            return redirect(mf.file.url)
        except Exception:
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
    permission_classes = [IsAuthenticated, CanManageMedia]

    def get(self, request, pk):
        mf = get_object_or_404(MediaFile, pk=pk)
        self.check_object_permissions(request, mf)
        
        url = (
            request.build_absolute_uri(mf.file.url)
            if mf.file
            else ''
        )
        return Response({'url': url})
