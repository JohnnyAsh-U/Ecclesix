from django.shortcuts import render
from rest_framework.views import APIView
from .models import City, Church_type, Church
from members.models import Member
from event.models import Event
from .serializers import CitySerializer, TypeSerializer, ChurchSerializer
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import status
from . import services


class CityListCreateView(ListCreateAPIView):
    serializer_class = CitySerializer
    queryset = City.objects.prefetch_related("city_church")


class CityRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = CitySerializer
    queryset = City.objects.prefetch_related("city_church")


class TypeListCreateView(ListCreateAPIView):
    serializer_class = TypeSerializer
    queryset = Church_type.objects.prefetch_related("type_church")


class TypeRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = TypeSerializer
    queryset = Church_type.objects.prefetch_related("type_church")


class ChurchListCreateView(ListCreateAPIView):
    serializer_class = ChurchSerializer
    queryset = Church.objects.all()


class ChurchRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = ChurchSerializer
    queryset = Church.objects.all()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        id = kwargs['pk']
        
        

        metrics = {
            "sixMonthEventCount": services.TotalMembersForSixMonth(id),
            "sixMonthMemberCount": services.TotalEventsForSixMonth(id),
            "sixMonthAttendanceCount": services.TotalAttendanceForSixMonth(id),
            "totalEvents": Event.objects.filter(church=id).count(),
            "totalMembers": Member.objects.filter(church=id).count(),
            "ageRangeMemberCount": services.AgeRangeCount(id),
            "attendanceGraphMonth": services.AttendanceMonthGraph(id),
            "attendanceGraphYear": [],
            "Demo_Profession": services.Professions(id),
            "Demo_Statut" : services.Marital_Status(id),
            "Demo_Sexe" : services.Gender(id)
        }

        return Response({"church": serializer.data, "metrics": metrics})
