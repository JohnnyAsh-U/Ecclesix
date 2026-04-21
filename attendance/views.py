from enum import member

from rest_framework.generics import ListCreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from .models import Attendance
from .serializers import AttendanceSerializer
from .utils import (
    create_visitor_member,
    get_member_by_id,
    parse_birthdate,
    parse_bool,
    resolve_member_from_identity,
    update_event_attendance_totals,
    validate_qr,
)
from admin_custom.models import Log
from members.models import Member
from event.models import Event
from event.serializers import EventSerializer
from datetime import date, timedelta
import math


class MobileOutboxSyncView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["ajouter_evenement"],
    }

    def post(self, request, *args, **kwargs):
        raw_items = request.data if isinstance(request.data, list) else request.data.get("items", [])

        if not isinstance(raw_items, list):
            return Response(
                {"detail": "Le corps de la requête doit contenir une liste d'éléments outbox."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        synced_ids = []
        skipped = []

        for raw_item in raw_items:
            outbox_id = str(raw_item.get("id", "")).strip()
            user_id = str(raw_item.get("user_id", "")).strip()
            event_id = raw_item.get("event_id")
            arrival_time_str = raw_item.get("arrival_time")
            if arrival_time_str:
                try:
                    arrival_time = timezone.datetime.fromisoformat(arrival_time_str)
                except ValueError:
                    arrival_time = timezone.localtime()
            else:
                arrival_time = timezone.localtime()

            if not outbox_id or not event_id:
                skipped.append({"id": outbox_id or None, "reason": "missing-event-or-id"})
                continue

            event = Event.objects.filter(pk=event_id).first()
            if not event:
                skipped.append({"id": outbox_id, "reason": "event-not-found"})
                continue

            # if request.user.church_id and event.church_id != request.user.church_id and not request.user.is_superuser:
            #     skipped.append({"id": outbox_id, "reason": "forbidden-church"})
            #     continue

            is_visitor = parse_bool(raw_item.get("is_visitor"))
            qrcode = (raw_item.get("qrcode") or "").strip()
            first_name = (raw_item.get("user_first_name") or "").strip()
            last_name = (raw_item.get("user_last_name") or "").strip()
            phone = (raw_item.get("phone") or "").strip() or None
            gender = raw_item.get("gender")
            birthdate = parse_birthdate(raw_item.get("dob"))

            with transaction.atomic():
                if is_visitor:
                    member = resolve_member_from_identity(first_name, last_name, phone, event.church_id)
                    
                    if not member:
                        member = create_visitor_member(
                            first_name,
                            last_name,
                            phone,
                            event.church_id,
                            gender=gender,
                            birthdate=birthdate,
                        )
                elif not qrcode:
                    member = get_member_by_id(user_id)
                    if not member:
                        skipped.append({"id": outbox_id, "reason": "member-not-found"})
                        continue
                else:
                    member = validate_qr(qrcode)
                    if not member:
                        skipped.append({"id": outbox_id, "reason": "invalid-qrcode"})
                        continue

                # if member.church_id and member.church_id != event.church_id and not request.user.is_superuser:
                #     skipped.append({"id": outbox_id, "reason": "member-not-in-church"})
                #     continue

                attendance_row, created = Attendance.objects.get_or_create(
                    member_id=member.pk,
                    event_type_id=event.event_type_id,
                    church_id=event.church_id,
                    date=event.event_date,
                    defaults={
                        "created_by_id": request.user.id,
                        "arrival_time": arrival_time.time(),
                        "notes": "Synchronisé depuis l'application mobile",
                    },
                )

                if created:
                    update_event_attendance_totals(event, member, birthdate=birthdate, gender=gender)
                else:
                    fields_to_update = []
                    if attendance_row.arrival_time is None:
                        attendance_row.arrival_time = arrival_time.time()
                        fields_to_update.append("arrival_time")
                    if not attendance_row.created_by_id:
                        attendance_row.created_by_id = request.user.id
                        fields_to_update.append("created_by")
                    if not attendance_row.notes:
                        attendance_row.notes = "Synchronisé depuis l'application mobile"
                        fields_to_update.append("notes")
                    if fields_to_update:
                        attendance_row.save(update_fields=fields_to_update)

                synced_ids.append(outbox_id)

        return Response(
            {
                "synced_ids": synced_ids,
                "synced_count": len(synced_ids),
                "skipped": skipped,
                "skipped_count": len(skipped),
            },
            status=status.HTTP_200_OK,
        )


class AttendanceMembersListView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["ajouter_evenement"],
    }

    def get(self, request, *args, **kwargs):
        if not request.user.church_id:
            return Response([], status=status.HTTP_200_OK)

        members = (
            Member.objects.filter(church_id=request.user.church_id, is_active=True)
            .order_by("first_name", "last_name")
        )

        data = [
            {
                "id": member.id,
                "get_full_name": member.get_full_name(),
                "phone": member.phone,
            }
            for member in members
        ]
        return Response(data, status=status.HTTP_200_OK)


class AttendanceEventsListView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
    }

    def get(self, request, *args, **kwargs):
        if not request.user.church_id:
            return Response([], status=status.HTTP_200_OK)

        today = date.today()
        yesterday = today - timedelta(days=1)

        events = (
            Event.objects.select_related("event_type", "church")
            .filter(
                church_id=request.user.church_id,
                event_date__in=[yesterday, today],
            )
            .order_by("-event_date", "event_type__start_time", "id")
        )

        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        if not user.is_superuser and not user.has_perm_custom("voir_touts_evenements"):
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


class EventAttendanceStatsView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
    }

    def get(self, request, event_id, *args, **kwargs):
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Evenement non trouve"}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_superuser and event.church_id != request.user.church_id:
            return Response({"detail": "Acces refuse"}, status=status.HTTP_403_FORBIDDEN)

        total_members = Member.objects.filter(church_id=event.church_id, is_active=True).count()
        present = Attendance.objects.filter(
            event_type_id=event.event_type_id,
            church_id=event.church_id,
            date=event.event_date,
        ).count()
        absent = total_members - present

        return Response({
            "total_members": total_members,
            "present": present,
            "absent": absent,
        })


class BulkMarkAttendanceView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["ajouter_evenement"],
    }

    def post(self, request, event_id, *args, **kwargs):
        """
        Mark multiple members as present for a specific event.
        
        Request body:
        {
            "ids": [member_id1, member_id2, ...]
        }
        """
        try:
            # Get the event
            event = Event.objects.get(pk=event_id)
            
            # Get member IDs from request body
            member_ids = request.data.get("ids", [])
            if not isinstance(member_ids, list):
                return Response(
                    {"detail": "ids doit etre une liste d'identifiants membres"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            if not member_ids:
                return Response(
                    {"detail": "Aucun membre fourni"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Verify user has access to this church's event
            if not request.user.is_superuser and event.church_id != request.user.church_id:
                return Response(
                    {"detail": "Acces refuse"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            # Create or update attendance records
            created_count = 0
            updated_count = 0
            failed_ids = []
            
            with transaction.atomic():
                for member_id in member_ids:
                    try:
                        attendance, created = Attendance.objects.get_or_create(
                            member_id=member_id,
                            event_type_id=event.event_type_id,
                            church_id=event.church_id,
                            date=event.event_date,
                            defaults={
                                "created_by_id": request.user.id,
                                "arrival_time": timezone.localtime().time(),
                            },
                        )
                        
                        if created:
                            birthdate = getattr(attendance.member, "birthdate", None)
                            gender = getattr(attendance.member, "gender", None)
                            update_event_attendance_totals(event, attendance.member, birthdate=birthdate, gender=gender)
                            created_count += 1
                        else:
                            updated_count += 1
                    except Exception as e:
                        failed_ids.append(member_id)
                        continue
            
            return Response(
                {
                    "message": "Presences enregistrees avec succes",
                    "created": created_count,
                    "updated": updated_count,
                    "failed_ids": failed_ids,
                    "total_processed": created_count + updated_count,
                },
                status=status.HTTP_200_OK,
            )
        
        except Event.DoesNotExist:
            return Response(
                {"detail": "Evenement non trouve"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
