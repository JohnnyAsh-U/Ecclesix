import os

from rest_framework.views import APIView
from django.contrib.auth.models import Permission
from django.core.cache import cache
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.response import Response
from .serializers import AdminMemberSerializer, SimpleChurchSerializer
from django.conf import settings as django_settings
from django.core.mail import EmailMultiAlternatives, get_connection
from rest_framework.mixins import UpdateModelMixin
from django.forms.models import model_to_dict
from .services import ViewLogger, load_app_configs_to_cache
from rest_framework.exceptions import bad_request
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from church.models import Church
from members.models import Member
from .models import Appconfig, Log, Role
from dateutil.relativedelta import relativedelta
from datetime import date
from .serializers import LogSerializer, RoleSerializer, PermissionSerializer
from dateutil.parser import parse
from .constant import (
    EMAIL_SMTP_HOST_KEY,
    EMAIL_SMTP_PASSWORD_KEY,
    EMAIL_SMTP_PORT_KEY,
    EMAIL_SMTP_PROTOCOL_KEY,
    EMAIL_SMTP_USERNAME_KEY,
)


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
    public_configs = {
        key: value for key, value in configs.items()
    }
    return Response(public_configs)


@api_view(["GET", "PATCH"])
@permission_classes([])
def EmailConfigView(request, *args, **kwargs):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        configs = load_app_configs_to_cache(force=True)
        return Response(
            {
                "smtp_host": configs.get(EMAIL_SMTP_HOST_KEY, ""),
                "smtp_port": configs.get(EMAIL_SMTP_PORT_KEY, "587"),
                "smtp_username": configs.get(EMAIL_SMTP_USERNAME_KEY, ""),
                "smtp_protocol": configs.get(EMAIL_SMTP_PROTOCOL_KEY, "SSL"),
            }
        )

    config_data = request.data if isinstance(request.data, dict) else {}
    tracked_config = {
        EMAIL_SMTP_HOST_KEY: config_data.get("smtp_host", ""),
        EMAIL_SMTP_PORT_KEY: config_data.get("smtp_port", "587"),
        EMAIL_SMTP_USERNAME_KEY: config_data.get("smtp_username", ""),
        EMAIL_SMTP_PASSWORD_KEY: config_data.get("smtp_password", ""),
        EMAIL_SMTP_PROTOCOL_KEY: config_data.get("smtp_protocol", "SSL"),
    }

    for key, value in tracked_config.items():
        Appconfig.objects.update_or_create(
           config_key=key,
           defaults={"config_value": value}
        )

    load_app_configs_to_cache(force=True)
    Log.objects.create(
        admin=request.user,
        log_type="UPDATE",
        detail={
            "resource": "AppConfig",
            "changes": {"updated_keys": list(tracked_config.keys())},
        },
    )
    return Response(
        {
            "smtp_host": tracked_config[EMAIL_SMTP_HOST_KEY],
            "smtp_port": tracked_config[EMAIL_SMTP_PORT_KEY],
            "smtp_username": tracked_config[EMAIL_SMTP_USERNAME_KEY],
            "smtp_password": tracked_config[EMAIL_SMTP_PASSWORD_KEY],
            "smtp_protocol": tracked_config[EMAIL_SMTP_PROTOCOL_KEY],
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([])
def SupportEmailView(request, *args, **kwargs):
    payload = request.data if isinstance(request.data, dict) else {}
    title = payload.get("title")
    message = payload.get("message")
    email = payload.get("email")
    phone = payload.get("phone")

    if not title or not message:
        return Response(
            {"detail": "Le titre et le message sont requis"},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Vous devez être connecté pour contacter le support"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Get the user name and church name if available
    user = request.user if request.user.is_authenticated else None
    full_name = user.get_full_name() if user else "Utilisateur non authentifié"
    church_name = getattr(getattr(request, "tenant", None), "name", "Eglise inconnue")
    email_config = load_app_configs_to_cache(force=True)

    smtp_host = email_config.get(EMAIL_SMTP_HOST_KEY, "")
    smtp_port = email_config.get(EMAIL_SMTP_PORT_KEY, "587")
    smtp_username = email_config.get(EMAIL_SMTP_USERNAME_KEY, "")
    smtp_password = email_config.get(EMAIL_SMTP_PASSWORD_KEY, "")
    smtp_protocol = email_config.get(EMAIL_SMTP_PROTOCOL_KEY, "SSL")

    support_recipient = os.getenv("SUPPORT_EMAIL") or os.getenv("support_email") or getattr(django_settings, "EMAIL_HOST_USER", None)

    connection_kwargs = {"fail_silently": False}

    if smtp_host:
        connection_kwargs.update(
            {
                "host": smtp_host,
                "port": int(smtp_port or 587),
                "username": smtp_username,
                "password": smtp_password,
                "use_tls": smtp_protocol.upper() == "TLS",
                "use_ssl": smtp_protocol.upper() == "SSL",
            }
        )

    try:
        connection = get_connection(**connection_kwargs)
        sender_email = smtp_username or getattr(
            django_settings, "EMAIL_HOST_USER", "support@ecclesix.com"
        )
        sender_name = "Ecclesix"

        composed_message = (
            f"Nom: {full_name}\n"
            f"Eglise: {church_name}\n"
            f"Téléphone: {phone}\n"
            f"Email: {email}\n\n"
            f"Message:\n{message}"
        )

        email = EmailMultiAlternatives(
            f"[Support Ecclesix] {title}",
            composed_message,
            f"{sender_name} <{sender_email}>",
            [support_recipient],
            reply_to=[email] if email else None,
            connection=connection,
        )
        email.send(fail_silently=False)
    except Exception as exc:
        return Response(
            {"detail": f"Echec d’envoi de l’email: {str(exc)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"detail": "Message envoyé au support avec succès"},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([])
def TestEmailConfigView(request, *args, **kwargs):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    payload = request.data if isinstance(request.data, dict) else {}
    smtp_host = payload.get("smtp_host")
    smtp_port = payload.get("smtp_port")
    smtp_username = payload.get("smtp_username")
    smtp_password = payload.get("smtp_password")
    smtp_protocol = payload.get("smtp_protocol", "SSL")
    if not smtp_host or not smtp_port or not smtp_username or not smtp_password:
        return Response(
            {"detail": "Veuillez renseigner smtp_host, port, username et password"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    support_recipient = os.getenv("SUPPORT_EMAIL")
    

    if not support_recipient:
        return Response(
            {"detail": "Veuillez définir SUPPORT_EMAIL dans l’environnement"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        connection = get_connection(
            host=smtp_host,
            port=int(smtp_port),
            username=smtp_username,
            password=smtp_password,
            use_tls=smtp_protocol.upper() == "TLS",
            use_ssl=smtp_protocol.upper() == "SSL",
            fail_silently=False,
        )
        email = EmailMultiAlternatives(
            "Test de configuration SMTP",
            "Votre configuration email fonctionne correctement.",
            f"Ecclesix <{smtp_username}>",
            [support_recipient],
            connection=connection,
        )
        email.send(fail_silently=False)
    except Exception as exc:
        return Response(
            {"detail": f"Echec d’envoi de l’email de test: {str(exc)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"detail": "Email de test envoyé avec succès"},
        status=status.HTTP_200_OK,
    )


class AdminPermissions(APIView):
    permission_classes = []

    def get(self, request, format=None):
        user: Member = request.user
        cache_key = f"admin_permissions:{user.id}:{int(user.is_superuser)}"
        cached_payload = cache.get(cache_key)

        if cached_payload is not None:
            return Response(cached_payload)

        serialized_church = SimpleChurchSerializer(Church.objects.all(), many=True)
        perms = sorted(list(user.get_all_permissions())) if user.get_all_permissions() else []
        permissions = {"superAdmin": user.is_superuser, "perms": perms}
        payload = {"permissions": permissions, "churches": serialized_church.data}
        

        cache.set(cache_key, payload, timeout=300)  # Cache for 5 minutes
        return Response(payload)


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
