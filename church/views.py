from .models import City, Church_type, Church
from members.models import Member
from admin_custom.models import Log
from event.models import Event
from .serializers import CitySerializer, TypeSerializer, ChurchSerializer
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import status
from . import services
from admin_custom.services import ViewLogger
from rest_framework.decorators import api_view, authentication_classes, permission_classes


class CityListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "POST": ["superadmin"],
    }
    serializer_class = CitySerializer
    queryset = City.objects.prefetch_related("city_church")
    
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": 'Ville',
            "id": serializer.data['id'],
            "lib": serializer.data['city_name']
        }
        Log.objects.create(
            admin_id = request.user.id,
            log_type = "INSERT",
            detail = detail
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class CityRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PUT": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = CitySerializer
    queryset = City.objects.prefetch_related("city_church")
    
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
        detail = {"resource": "Ville", "id": instance.pk, "lib": str(instance)}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TypeListCreateView(ListCreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "POST": ["superadmin"],
    }
    serializer_class = TypeSerializer
    queryset = Church_type.objects.prefetch_related("type_church")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": 'TypeEglise',
            "id": serializer.data['id'],
            "lib": serializer.data['church_type_name']
        }
        Log.objects.create(
            admin_id = request.user.id,
            log_type = "INSERT",
            detail = detail
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TypeRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PUT": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = TypeSerializer
    queryset = Church_type.objects.prefetch_related("type_church")
    
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
        detail = {"resource": "TypeEglise", "id": instance.pk, "lib": str(instance)}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChurchListCreateView(ListCreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "POST": ["superadmin"],
    }
    serializer_class = ChurchSerializer
    queryset = Church.objects.all()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": 'Eglise',
            "id": serializer.data['id'],
            "lib": serializer.data['church_name']
        }
        Log.objects.create(
            admin_id = request.user.id,
            log_type = "INSERT",
            detail = detail
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class ChurchRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PUT": ["modifier_eglise"],
        "DELETE": ["superadmin"],
    }
    serializer_class = ChurchSerializer
    queryset = Church.objects.all()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

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
        detail = {"resource": "Eglise", "id": instance.pk, "lib": str(instance)}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        id = kwargs["pk"]
        ViewLogger(request.user.id, detail={"resource" : 'Eglise'})
        

        metrics = {
            "sixMonthEventCount": services.TotalEventsForSixMonth(id),
            "sixMonthMemberCount": services.TotalMembersForSixMonth(id),
            "sixMonthAttendanceCount": services.TotalAttendanceForSixMonth(id),
            "totalEvents": Event.objects.filter(church_id=id).count(),
            "totalMembers": Member.objects.filter(church_id=id).count(),
            "ageRangeMemberCount": services.AgeRangeCount(id),
            "attendanceGraphMonth": services.AttendanceMonthGraph(id),
            "attendanceGraphYear": services.AttendanceYearGraph(id),
            "Demo_Profession": services.Professions(id),
            "Demo_Statut": services.Marital_Status(id),
            "Demo_Sexe": services.Gender(id),
        }

        return Response({"church": serializer.data, "metrics": metrics})
    
    

@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
def get_church_logo_from_domain(request):
    # get tenant from request
    tenant = getattr(request, "tenant", None)
    if tenant and tenant.custom_logo and tenant.logo:
        build_url = request.build_absolute_uri(tenant.logo.url)
        return Response({"logo_url": build_url}, status=status.HTTP_200_OK)
    return Response({"logo_url": None}, status=status.HTTP_404_NOT_FOUND)
