from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, ListCreateAPIView, GenericAPIView
from rest_framework.response import Response
from .serializers import AdminMemberSerializer, SimpleChurchSerializer
from rest_framework.mixins import UpdateModelMixin
from django.forms.models import model_to_dict
from .services import ViewLogger
from rest_framework.exceptions import bad_request
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from church.models import Church
from members.models import Member
from .models import Log, Role
from dateutil.relativedelta import relativedelta
from datetime import date
from .serializers import LogSerializer, RoleSerializer
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
        if not instance.is_admin:
            raise bad_request(request)
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


class AdminPermissions(APIView):
    permission_classes = []

    def get(self, request, format=None):
        serialized_church = SimpleChurchSerializer(Church.objects.all(), many=True)
        user: Member = request.user
        perms = []
        user_perms = user.get_all_permissions()
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
