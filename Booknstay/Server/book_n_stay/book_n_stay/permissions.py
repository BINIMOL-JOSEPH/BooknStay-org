from rest_framework import permissions

# Admin permissions
class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['admin'] 

# Admin And Supervisor permissions
class AdminSupervisorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['admin','supervisor']

# All user permissions
class All(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['admin','supervisor','customer','hotel'] 

#Customer permissions
class CustomerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['customer'] 
    
#Hotel Permissions
class HotelPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['hotel'] 

#Hotel and Admin permissions
class HotelAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['hotel','admin'] 
    
# Hotel, Supervisor and Admin permissions
class HotelAdminSupervisorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.userType in ['hotel','admin','supervisor'] 
