from rest_framework.views import APIView
from django.contrib.auth.models import Permission
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.response import Response
from .serializers import AdminMemberSerializer, SimpleChurchSerializer
from rest_framework.mixins import UpdateModelMixin
from django.forms.models import model_to_dict
from .services import ViewLogger, load_app_configs_to_cache
from rest_framework.exceptions import bad_request
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from church.models import Church
from members.models import Member
from .models import Log, Role
from dateutil.relativedelta import relativedelta
from datetime import date
from .serializers import LogSerializer, RoleSerializer, PermissionSerializer
from dateutil.parser import parse


class LogView(ListAPIView):
    serializer_class = LogSerializer
    queryset = Log.objects.all().order_by("-action_time")
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_adminlog"],
    }

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        id = params.get("id", None)
        limit = params.get("limit", None)
        queryset = self.filter_queryset(self.get_queryset())
        if id and limit:
            queryset = queryset.filter(admin_id=int(id))[: int(limit)]
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        else:
            today = date.today()
            ten_days_ago = today + relativedelta(days=-10)
            queryset = queryset.filter(action_time__date__range=(ten_days_ago, today))
        serializer = self.get_serializer(queryset, many=True)
        logs = serializer.data
        arranged_logs = []
        for log in logs:
            log_date = date.strftime(parse(log["action_time"]), "%Y-%m-%d")
            log_date_exist = next(
                (
                    each_log
                    for each_log in arranged_logs
                    if each_log["date_time"] == log_date
                ),
                None,
            )
            if log_date_exist:
                log_date_exist["logs"].append(log)
            else:
                arranged_logs.append({"date_time": log_date, "logs": []})
                log_date_exist = next(
                    (
                        each_log
                        for each_log in arranged_logs
                        if each_log["date_time"] == log_date
                    ),
                    None,
                )
                log_date_exist["logs"].append(log)
        return Response(arranged_logs)


class AdminListView(ListAPIView):
    serializer_class = AdminMemberSerializer
    queryset = Member.objects.filter(is_admin=True)
    perms = {
        "GET": ["superadmin"],
        "OPTIONS": ["superadmin"],
    }

    def get(self, request, *args, **kwargs):
        ViewLogger(request.user.id, {"resource": "Admin"})
        return super().get(request, *args, **kwargs)


@api_view(["PATCH"])
@permission_classes([])
def AddAdmin(request, pk, *args, **kwargs):
    admin = request.user
    if admin.is_superuser:
        instance = Member.objects.get(id=pk)
        # admin cannot remove or add his profile as admin
        if admin.id == instance.id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # toggling of admin field keep superadmin field false
        instance.is_superuser = False
        instance.is_admin = not instance.is_admin
        instance.save()
        detail = {
            "resource": "Admin",
            "id": pk,
            "lib": instance.get_full_name(),
            "changes": {
                "old": {"admin": not instance.is_admin},
                "new": {"admin": instance.is_admin},
            },
        }
        Log.objects.create(admin=admin, log_type="UPDATE", detail=detail)
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(["PATCH"])
@permission_classes([])
def AddSuperAdmin(request, pk, *args, **kwargs):
    admin = request.user
    if admin.is_superuser:
        instance = Member.objects.get(id=pk)
        # admin cannot add or remove his profile as superuser
        if admin.id == instance.id:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not instance.is_admin or admin.id != 1:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        instance.is_superuser = not instance.is_superuser
        instance.save()
        detail = {
            "resource": "SuperAdmin",
            "id": pk,
            "lib": instance.get_full_name(),
            "changes": {
                "old": {"superadmin": not instance.is_superuser},
                "new": {"superadmin": instance.is_superuser},
            },
        }
        Log.objects.create(admin=admin, log_type="UPDATE", detail=detail)
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@permission_classes([])
def AppConfigView(request, *args, **kwargs):
    configs = load_app_configs_to_cache()
    return Response(configs)


class AdminPermissions(APIView):
    permission_classes = []

    def get(self, request, format=None):
        serialized_church = SimpleChurchSerializer(Church.objects.all(), many=True)
        user: Member = request.user
        perms = []
        user_perms = user.get_all_permissions()
        if user_perms:
            for perm in user_perms:
                perms.append(model_to_dict(perm)["codename"])
        permissions = {"superAdmin": user.is_superuser, "perms": perms}
        return Response(
            {"permissions": permissions, "churches": serialized_church.data}
        )


class RolesListCreateView(ListCreateAPIView):
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    perms = {"OPTIONS": ["superadmin"], "GET": [], "POST": ["superadmin"]}

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        perms = PermissionSerializer(
            Permission.objects.all().exclude(content_type_id__in=[1, 2, 3, 4, 5]),
            many=True,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response({"roles": serializer.data, "perms": perms.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        detail = {
            "resource": "Role",
            "id": serializer.data["id"],
            "lib": serializer.data["role_name"],
        }
        Log.objects.create(admin=request.user, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class RoleUpdateDestroyView(UpdateAPIView, DestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Role",
            "id": instance.pk,
            "lib": instance.role_name,
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([])
def AddPermissionToRole(request, pk, *args, **kwargs):
    admin = request.user
    if not admin.is_superuser:
        return Response(status=status.HTTP_403_FORBIDDEN)
    role = Role.objects.get(id=pk)
    old_perms = [perm.name for perm in role.permission.all()]
    
    perms_args = request.data
    new_perms_instances = [Permission.objects.get(id=perm['value']) for perm in perms_args]
    
    role.permission.set(new_perms_instances)
    
    new_perms = [perm.name for perm in role.permission.all()]

    detail = {
        "resource": "Role-Permissions",
        "id": role.pk,
        "lib": role.role_name,
        "changes": {
            "old": {"permissions": old_perms},
            "new": {"permissions": new_perms},
        },
    }
    Log.objects.create(admin=admin, log_type="UPDATE", detail=detail)
    return Response(status=status.HTTP_200_OK)
