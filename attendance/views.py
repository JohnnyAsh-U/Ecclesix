from rest_framework.generics import ListCreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import Signer, BadSignature
from .models import Attendance
from .serializers import AttendanceSerializer
from admin_custom.models import Log
from members.models import Member
from datetime import date
import json
import math


signer = Signer()


def validate_qr(signed_payload):
    try:
        unsigned = signer.unsign(signed_payload)
        data = json.loads(unsigned)

        member_id = data.get("id")
        member = Member.objects.get(pk=member_id)

        if member.qr_secret != data.get("sec"):
            return None

        return member
    except (BadSignature, Member.DoesNotExist, json.JSONDecodeError, TypeError, ValueError):
        return None


class AttendanceListCreateView(ListCreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
        "POST": ["ajouter_evenement"],
    }

    def list(self, request, *args, **kwargs):
        today = date.today()
        user = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 15))
        church = params.get("eglise", "tout")
        event_type = params.get("type_evenement", "tout")
        member = params.get("membre", "tout")
        month = params.get("mois", today.month)
        year = params.get("annee", today.year)

        offset = (page - 1) * limit
        queryset = (
            self.get_queryset()
            .select_related("member", "event_type", "church", "created_by")
            .order_by("-date")
        )

        queryset = queryset.filter(date__year=year)

        if month != "tout":
            queryset = queryset.filter(date__month=int(month))

        if event_type != "tout":
            queryset = queryset.filter(event_type_id=event_type)

        if member != "tout":
            queryset = queryset.filter(member_id=member)

        if not user.is_superuser and not user.has_perm_custom("voir_toutes_presences"):
            queryset = queryset.filter(church_id=user.church_id)
        elif church != "tout":
            queryset = queryset.filter(church_id=church)

        total = queryset.count()
        queryset = queryset[offset: offset + limit]
        total_pages = math.ceil(total / limit) if total else 1

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "list": serializer.data,
            "total_pages": total_pages,
            "total_attendances": total,
        })

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        signed_payload = data.pop("qr_code_secret", None)

        if signed_payload:
            qr_member = validate_qr(signed_payload)
            if not qr_member:
                return Response(
                    {"detail": "QR code invalide ou falsifie."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payload_member = data.get("member")
            if payload_member and str(payload_member) != str(qr_member.pk):
                return Response(
                    {"detail": "Le membre du QR code ne correspond pas au membre selectionne."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data["member"] = qr_member.pk

        if not data.get("created_by"):
            data["created_by"] = request.user.id
        if not data.get("church"):
            data["church"] = request.user.church_id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": "Presence",
            "id": serializer.data["id"],
            "lib": f"{serializer.data['member_name']} - {serializer.data['event_type_name']} ({serializer.data['date']})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AttendanceUpdateDestroyView(UpdateAPIView, DestroyAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["modifier_evenement"],
        "DELETE": ["supprimer_evenement"],
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
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Presence",
            "id": instance.pk,
            "lib": str(instance),
            "date": str(instance.date),
            "eglise": str(instance.church),
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)
