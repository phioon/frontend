from app.models import UserCustom, Subscription
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    # Custom permission to allow just owners of an object to get or edit it.

    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user


class IsPremium(permissions.BasePermission):
    # Custom permission to allow access to Premium areas of the app.

    def has_object_permission(self, request, view, obj):
        subscription = request.user.userCustom.subscription.name
        return subscription == 'premium'


class IsPlatinum(permissions.BasePermission):
    # Custom permission to allow access to Premium areas of the app.

    def has_object_permission(self, request, view, obj):
        subscription = request.user.userCustom.subscription.name
        return subscription == 'platinum'
