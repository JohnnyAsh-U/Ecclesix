from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
import math

from admin_custom.models import Log
from .models import CommunicationLog
from .serializers import CommunicationSendSerializer, CommunicationMiniMemberSerializer
from .services import CommunicationService
from members.models import Member
from backend.utils import time_date


class CommunicationMemberListView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["envoyer_communication", "envoyer_toutes_communications"],
    }

    def get(self, request):
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 50))
        search = params.get("search", None)
        age = params.get("age", None)
        gender = params.get("sexe", None)
        marital_status = params.get("statut_matrimonial", None)
        profession_type = params.get("type_metier", None)
        church = params.get("eglise", None)
        Ministre = True if params.get("Ministre", None) == "true" else False
        Ouvrier = True if params.get("Ouvrier", None) == "true" else False
        Membre = True if params.get("Membre", None) == "true" else False
        Visiteur = True if params.get("Visiteur", None) == "true" else False
        baptise = True if params.get("baptise", None) == "true" else False
        non_baptise = True if params.get("non_baptise", None) == "true" else False
        actif = True if params.get("actif", None) == "true" else False
        inactif = True if params.get("inactif", None) == "true" else False

        offset = (page - 1) * limit
        queryset = Member.objects.all().order_by("first_name", "last_name")

        if search:
            names = search.split()
            query = Q()
            for name in names:
                query &= Q(first_name__istartswith=name) | Q(last_name__istartswith=name)
            queryset = queryset.filter(query)

        if gender and gender != "tout":
            queryset = queryset.filter(gender="H" if gender == "H" else "F")

        if age and age != "tout":
            queryset = queryset.filter(
                birthdate__range=(time_date.age_range_to_year_range(age))
            )

        if marital_status and marital_status != "tout":
            queryset = queryset.filter(marital_status=marital_status)

        if profession_type and profession_type != "tout":
            queryset = queryset.filter(profession_type=profession_type)

        if church and church != "tout":
            queryset = queryset.filter(church_id=church)

        if not user.is_superuser and not user.has_perm_custom("envoyer_toutes_communications"):
            queryset = queryset.filter(church_id=user.church_id)

        if not Ministre:
            queryset = queryset.exclude(status="Ministre")

        if not Ouvrier:
            queryset = queryset.exclude(status="Ouvrier")

        if not Membre:
            queryset = queryset.exclude(status="Membre")

        if not Visiteur:
            queryset = queryset.exclude(status="Visiteur")

        if not baptise:
            queryset = queryset.exclude(baptism_date__isnull=False)

        if not non_baptise:
            queryset = queryset.exclude(baptism_date__isnull=True)

        if not actif:
            queryset = queryset.exclude(is_active=True)

        if not inactif:
            queryset = queryset.exclude(is_active=False)

        total_members = queryset.count()
        total_pages = math.ceil(total_members / limit) if limit > 0 else 1
        queryset = queryset[offset : offset + limit]
        serializer = CommunicationMiniMemberSerializer(queryset, many=True)

        return Response(
            {
                "list": serializer.data,
                "total_pages": total_pages,
                "total_members": total_members,
            }
        )


class SendCommunicationView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["envoyer_communication", "envoyer_toutes_communications"],
    }

    def post(self, request):
        serializer = CommunicationSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel = serializer.validated_data["channel"]
        subject = serializer.validated_data.get("subject", "")
        message = serializer.validated_data["message"]
        member_ids = serializer.validated_data["member_ids"]

        recipients = CommunicationService.get_recipients(request.user, member_ids)
        
        if not recipients:
            return Response(
                {"detail": "No recipients found for this user scope"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if channel == "email":
            result = CommunicationService.send_email(subject, message, recipients, request)
        else:
            result = CommunicationService.send_sms(message, recipients)

        comm_log = CommunicationLog.objects.create(
            channel=channel,
            subject=subject,
            message=message,
            recipients_count=len(recipients),
            success_count=result["success"],
            failed_count=result["failed"],
            detail={
                "reason": result["reason"],
                "recipient_ids": [m.id for m in recipients],
            },
            created_by=request.user,
        )

        Log.objects.create(
            admin_id=request.user.id,
            log_type="INSERT",
            detail={
                "resource": "Communication",
                "id": comm_log.id,
                "lib": f"{channel.upper()} ({result['success']}/{len(recipients)})",
            },
        )

        return Response(
            {
                "id": comm_log.id,
                "channel": channel,
                "recipients_count": len(recipients),
                "success_count": result["success"],
                "failed_count": result["failed"],
                "detail": result["reason"],
            },
            status=status.HTTP_201_CREATED,
        )
