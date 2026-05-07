"""
Permission classes for Django internal API endpoints.
Handles role-based access control via X-Internal-Key header.
"""

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
import logging
import os

logger = logging.getLogger(__name__)


admin_secret = os.getenv("INTERNAL_API_SECRET_ADMIN", "admin_secret")
mod_secret = os.getenv("INTERNAL_API_SECRET_MOD", "mod_secret")

class InternalAPIPermission(BasePermission):
    """
    Base permission class for internal API endpoints.
    Extracts and validates the role from X-Internal-Key header.
    """
    ADMIN_HEADER = admin_secret
    MOD_HEADER = mod_secret
    ROLE_HEADER = "X-Internal-Token"
    ROLE_HEADER_MAPPER = {
        ADMIN_HEADER: "admin",
        MOD_HEADER: "mod",
    }
    ALLOWED_ROLES = [ADMIN_HEADER, MOD_HEADER]
    
    def get_role_from_request(self, request) -> str:
        """
        Extract user role from X-Internal-Key header.
        
        Returns:
            str: The role (admin, mod) or None if not present/invalid
        """
        role = request.headers.get(self.ROLE_HEADER, "").lower()
        
        if role in self.ROLE_HEADER_MAPPER:
            return self.ROLE_HEADER_MAPPER[role]
        return None
    
    def has_permission(self, request, view) -> bool:
        """Override in subclasses to define specific role requirements."""
        raise NotImplementedError("Subclasses must implement has_permission")


class IsInternalAdmin(InternalAPIPermission):
    """
    Permission class that allows only admin role.
    Denies requests with mod role or missing role.
    """
    
    message = "Admin access required. You must have admin role."
    
    def has_permission(self, request, view) -> bool:
        """Allow only requests with admin role."""
        role = self.get_role_from_request(request)
        
        if role != "admin":
            logger.warning(
                f"Admin access denied. Role: {role}, Path: {request.path}, Method: {request.method}"
            )
            return False
        
        logger.info(f"Admin access granted. Path: {request.path}, Method: {request.method}")
        return True


class IsInternalAdminOrMod(InternalAPIPermission):
    """
    Permission class that allows either admin or mod role.
    This is the most common use case for internal endpoints.
    """
    
    message = "Internal access required. You must have admin or mod role."
    
    def has_permission(self, request, view) -> bool:
        """Allow requests with admin or mod role."""
        role = self.get_role_from_request(request)
        
        if role not in ["admin", "mod"]:
            logger.warning(
                f"Internal access denied. Role: {role}, Path: {request.path}, Method: {request.method}"
            )
            return False
        
        # Store role in request for later use in views
        request.internal_role = role
        logger.info(
            f"Internal access granted. Role: {role}, Path: {request.path}, Method: {request.method}"
        )
        return True

