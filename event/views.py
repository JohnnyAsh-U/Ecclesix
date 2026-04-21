from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
    DestroyAPIView,
    ListAPIView,
)
from .models import Event, Event_Type
from rest_framework.response import Response
from rest_framework import status
from .serializers import EventSerializer, EventTypeSerializer
from members.models import Member
from attendance.models import Attendance
from datetime import date
from admin_custom.services import ViewLogger
from admin_custom.models import Log
import math


class EventListCreateView(ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
        "POST": ["ajouter_evenement"],
    }

    def list(self, request, *args, **kwargs):
        today = date.today()
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 15))
        church = params.get("eglise", "tout")
        event_type = params.get("type_evenement", "tout")
        month = params.get("mois", today.month)
        year = params.get("annee", today.year)

        offset = (page - 1) * limit
        queryset = self.get_queryset().order_by("-event_date")

        queryset = queryset.filter(event_date__year=year)

        if month == "tout":
            queryset = queryset.filter(event_date__month__range=(1, 12))
        else:
            queryset = queryset.filter(event_date__month=int(month) + 1)

        if event_type != "tout":
            queryset = queryset.filter(event_type_id=event_type)

        if church != "tout":
            queryset = queryset.filter(church_id=church)

        # to make sure admin can only view what they are permitted to view
        if not user.is_superuser and not user.has_perm_custom("voir_touts_evenements"):
            queryset = queryset.filter(church_id=church)

        total_event = queryset.count()
        queryset = queryset[offset : offset + limit]
        total_pages = math.ceil(total_event / limit)

        serializer = self.get_serializer(queryset, many=True)
        ViewLogger(request.user.id, {"resource": "Evenement"})
        return Response(
            {
                "list": serializer.data,
                "total_pages": total_pages,
                "total_events": total_event,
            }
        )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if not data.get("church") and getattr(request.user, "church_id", None):
            data["church"] = request.user.church_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        detail = {
            "resource": "Evenement",
            "id": serializer.data["id"],
            "lib": f"{serializer.data['event_type_name']} ({serializer.data['church_name']})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class EventUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all().order_by("event_date")
    serializer_class = EventSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["ajouter_evenement"],
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
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Evenement",
            "id": instance.pk,
            "lib": instance.event_name,
            "date_evenement": str(instance.event_date),
            "eglise_evenement": str(instance.church)
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventAttendanceListView(ListAPIView):
    queryset = Attendance.objects.all()
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
    }

    def list(self, request, *args, **kwargs):
        user: Member = request.user
        event = Event.objects.filter(pk=kwargs["pk"]).first()

        if not event:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if (
            not user.is_superuser
            and not user.has_perm_custom("voir_touts_evenements")
            and user.church_id != event.church_id
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 15))
        offset = (page - 1) * limit

        queryset = (
            self.get_queryset()
            .select_related("member")
            .filter(
                event_type_id=event.event_type_id,
                church_id=event.church_id,
                date=event.event_date,
            )
            .order_by("member__first_name", "member__last_name")
        )

        total_attendance = queryset.count()
        total_pages = math.ceil(total_attendance / limit) if total_attendance else 1
        queryset = queryset[offset : offset + limit]

        attendance_list = [
            {
                "id": attendance.id,
                "member_id": attendance.member_id,
                "full_name": attendance.member.get_full_name(),
                "time": str(attendance.arrival_time) if attendance.arrival_time else None,
                "phone": attendance.member.phone,
            }
            for attendance in queryset
        ]

        return Response(
            {
                "list": attendance_list,
                "total_pages": total_pages,
                "total_attendance": total_attendance,
            }
        )



class EventTypeListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "POST": ["superadmin"],
    }
    serializer_class = EventTypeSerializer
    queryset = Event_Type.objects.all()

    def list(self, request, *args, **kwargs):
        user = request.user
        queryset = self.filter_queryset(self.get_queryset())
        church_id = (
            request.query_params.get("church_id")
            or request.query_params.get("church")
            or request.query_params.get("eglise")
            or user.church_id
        )

        # find the oldest event
        oldest_event = (
            Event.objects.filter(church_id=church_id)
            .order_by("event_date")
            .first()
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            data={"list": serializer.data, "first_event_date": getattr(oldest_event, "event_date", date.today())}
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": "Type Evenement",
            "id": serializer.data["id"],
            "lib": serializer.data["event_type_name"],
            "heure_debut": serializer.data.get("start_time"),
            "heure_fin": serializer.data.get("end_time"),
            "jour_semaine": serializer.data.get("event_day_of_week"),
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class EventTypeRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PUT": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = EventTypeSerializer
    queryset = Event_Type.objects.all()

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
            "resource": "Type Evenement",
            "id": instance.pk,
            "lib": instance.event_type_name,
            "heure_debut": str(instance.start_time) if instance.start_time else None,
            "heure_fin": str(instance.end_time) if instance.end_time else None,
            "jour_semaine": instance.event_day_of_week,
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)
