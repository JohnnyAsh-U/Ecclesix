from rest_framework import generics
from rest_framework.response import Response
from admin_custom.services import ViewLogger
from .services import (
    lastSixMembers,
    TotalMembersForSixMonth,
    TotalChurchForSixYears,
    TotalMinistersForSixMonth,
    TotalEventsForSixMonth,
    totalEventsCount,
    demographicsStatut,
    demographicsGender,
    demographicsProfessions,
    demographicsStatutM,
    AgeRangeCount,
    YearTraffic
)
from django.db import connection


class Dashboard(generics.ListAPIView):
    
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
    }

    def list(self, request, *args, **kwargs):
        lastSix =  lastSixMembers()
        SixMonthsMembersCount =  TotalMembersForSixMonth()
        SixYearsChurchCount =  TotalChurchForSixYears()
        SixMonthsMinistersCount =  TotalMinistersForSixMonth()
        SixMonthsEventCount =  TotalEventsForSixMonth()
        totalEvents =  totalEventsCount(),
        statut=  demographicsStatut()
        sexe =  demographicsGender()
        profession =  demographicsProfessions()
        statut_m =  demographicsStatutM()
        ageRange =  AgeRangeCount()
        yearTraffic =  YearTraffic()
        
        
        widgetMetrics = {
            "SixMonthsMembersCount": SixMonthsMembersCount,
            "SixYearsChurchCount": SixYearsChurchCount,
            "SixMonthsMinistersCount": SixMonthsMinistersCount,
            "SixMonthsEventCount":SixMonthsEventCount,
            "totalEvents": totalEvents
        }

        demographics = {
            "statut": statut,
            "sexe": sexe,
            "profession": profession,
            "statut_m": statut_m,
            "ageRange": ageRange,
            "yearTraffic": yearTraffic
        }

        ViewLogger(request.user.id, {"resource": "Dashboard"})
        return Response(
            {
                "lastSix": lastSix,
                "widgetMetrics": widgetMetrics,
                "demographics": demographics,
            }
        )
