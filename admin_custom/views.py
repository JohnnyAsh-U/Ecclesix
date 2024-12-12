from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.response import Response
from church.models import Church
from .models import Log, Role
from church.serializers import ChurchSerializer
from dateutil.relativedelta import relativedelta
from datetime import date
from .serializers import LogSerializer, RoleSerializer
from dateutil.parser import parse


class LogView(ListAPIView):
    serializer_class = LogSerializer
    today = date.today()
    ten_days_ago = today + relativedelta(days=-10)
    queryset = Log.objects.filter(
        action_time__date__range=(ten_days_ago, today)
    ).order_by("-action_time")
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_adminlog"],
    }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
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


class AdminPermissions(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        serialized_church = ChurchSerializer(Church.objects.all(), many=True)
        # print(self.request.META)
        ip = request.META.get("REMOTE_ADDR", None)
        print(ip)
        return Response(
            {"permissions": {"superAdmin": True}, "churches": serialized_church.data}
        )

class RolesListCreateView(ListCreateAPIView):
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST":["superadmin"]
    }