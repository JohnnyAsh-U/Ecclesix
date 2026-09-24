from django.db.models import Q

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from django.utils import timezone
from .serializers import TenantAnnouncementSerializer, OngoingAnnouncementSerializer
from .models import TenantAnnouncement



class OngoingAnnouncementListView(ListAPIView):
    """View for regular users to see ongoing published announcements"""
    serializer_class = OngoingAnnouncementSerializer
    perms = {"OPTIONS": [], "GET": []}
    
    def get_queryset(self):
        """Show only published, non-expired announcements for regular users"""
        user = self.request.user
        queryset = TenantAnnouncement.objects.filter(
            status='published'
        ).exclude(
            expiry_date__lt=timezone.now(),
            expiry_date__isnull=False
        )
        
        # If user has envoyer_toutes_communications, show all announcements
        if user.has_perm_custom("envoyer_toutes_communications"):
            return queryset.order_by('-published_at')
        
        # Otherwise, only show announcements for their church or for all churches
        if hasattr(user, 'church_id') and user.church_id:
            queryset = queryset.filter(
                Q(visibility='all') | Q(target_churches=user.church_id)
            ).distinct()
        else:
            queryset = queryset.filter(visibility='all')
        
        return queryset.order_by('-published_at')


class TenantAnnouncementListCreateView(ListCreateAPIView):
    serializer_class = TenantAnnouncementSerializer
    perms = {
        "OPTIONS": ["superadmin"], 
        "GET": ["envoyer_toutes_communications", "envoyer_communication"], 
        "POST": ["envoyer_toutes_communications", "envoyer_communication"]
    }
    
    def get_queryset(self):
        user = self.request.user
        queryset = TenantAnnouncement.objects.filter().order_by('-published_at')
                
        
        # Otherwise, only show announcements for their church or for all churches
        if not user.is_superuser and not user.has_perm_custom("envoyer_toutes_communications"):
            queryset = queryset.filter(
                Q(visibility='all') | Q(target_churches=user.church_id)
            ).distinct()
        
        
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user
        announcement = serializer.save(created_by=user)
        # If user doesn't have envoyer_toutes_communications, restrict to their church
        if not user.is_superuser and not user.has_perm_custom("envoyer_toutes_communications"):
            if hasattr(user, 'church_id') and user.church_id:
                announcement.target_churches.set([user.church_id])
                announcement.visibility = 'specific'
                announcement.save()

        # If created as published, set published_at now (if not already set)
        if announcement.status == 'published' and not announcement.published_at:
            announcement.published_at = timezone.now()
            announcement.save()


class TenantAnnouncementDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TenantAnnouncementSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PATCH": ["envoyer_toutes_communications", "envoyer_communication"],
        "DELETE": ["envoyer_toutes_communications", "envoyer_communication"],
    }
    
    def get_queryset(self):
        user = self.request.user
        queryset = TenantAnnouncement.objects.all()
        
        # If user has envoyer_toutes_communications, show all announcements
        if user.is_superuser or user.has_perm_custom("envoyer_toutes_communications"):
            return queryset
        
        # Otherwise, only show announcements for their church
        if hasattr(user, 'church_id') and user.church_id:
            queryset = queryset.filter(
                Q(visibility='all') | Q(target_churches=user.church_id)
            ).distinct()
        else:
            queryset = queryset.filter(visibility='all')
        
        return queryset
    
    def perform_update(self, serializer):
        user = self.request.user
        announcement = serializer.save()
        
        # If updating status to published, set published_at
        if announcement.status == 'published' and not announcement.published_at:
            announcement.published_at = timezone.now()
            announcement.save()
        
        # If user doesn't have envoyer_toutes_communications, enforce church restriction
        if not user.is_superuser and not user.has_perm_custom("envoyer_toutes_communications"):
            if hasattr(user, 'church_id') and user.church_id:
                announcement.target_churches.set([user.church_id])
                announcement.visibility = 'specific'
                announcement.save()
