from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Event, Event_Type
from rest_framework.response import Response
from rest_framework import status
from .serializers import EventSerializer, EventTypeSerializer
from members.models import Member
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
        queryset = self.get_queryset().order_by("event_date")

        queryset = queryset.filter(event_date__year=year)

        if month == "tout":
            queryset = queryset.filter(event_date__month__range=(1, 12))
        else:
            queryset = queryset.filter(event_date__month=int(month)+1)

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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class EventView(RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
        "PATCH": ["modifier_evenement"],
        "DELETE": ["supprimer_evenement"],
    }

    def retrieve(self, request, *args, **kwargs):
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 50))
        church = params.get("eglise", None)
        month = params.get("mois", None)
        year = params.get("annee", None)

        offset = (page - 1) * limit
        queryset = self.get_queryset().order_by("event_date")

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    

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
        
        #find the oldest event
        oldest_event = Event.objects.filter(church_id = user.church_id).order_by('event_date').first()

        serializer = self.get_serializer(queryset, many=True)
        return Response(data={"list": serializer.data, "first_event_date": oldest_event.event_date})
    
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": 'Type Evenement',
            "id": serializer.data['id'],
            "lib": serializer.data['event_type_name']
        }
        Log.objects.create(
            admin_id = request.user.id,
            log_type = "INSERT",
            detail = detail
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



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
        detail = {"resource": "Type Evenement", "id": instance.pk, "lib": instance.event_type_name}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)

