from rest_framework import permissions


class CanManageMedia(permissions.BasePermission):
    """Permission class for media files.
    
    - Unauthenticated: deny all
    - SAFE_METHODS (GET): check voir_mediafile or voirs_touts_mediafiles
    - Write/Delete: check ajouter_mediafile or supprimer_mediafile
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.has_perm('multimedia.voir_mediafile') 
                or request.user.has_perm('multimedia.voirs_touts_mediafiles')
            )
        
        # POST, PUT, PATCH, DELETE
        return (
            request.user.has_perm('multimedia.ajouter_mediafile')
            or request.user.has_perm('multimedia.supprimer_mediafile')
        )

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Delete/update: require permission or be the uploader
        if request.user.has_perm('multimedia.supprimer_mediafile'):
            return True
        
        try:
            member = getattr(request.user, 'member', None)
            if member and obj.uploaded_by_id == member.id:
                return True
        except Exception:
            pass
        
        return False
