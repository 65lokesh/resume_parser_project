"""
permissions.py — Custom DRF permission classes.
Extend here when authentication is added.
"""

from rest_framework.permissions import BasePermission


class AllowAny(BasePermission):
    """Open access — suitable for a demo / internal tool. Replace with auth when needed."""

    def has_permission(self, request, view):
        return True
