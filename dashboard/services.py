from members.models import Member
from members.serializers import MemberSerializer
from event.models import Event, Event_stats
from church.models import Church
from backend.utils import time_date
from datetime import date, datetime
from dateutil.relativedelta import *
from functools import reduce
from django.db import OperationalError, ProgrammingError
# from django.forms.models import model_to_dict
# from django.db.models import Sum


def lastSixMembers():
    result = Member.objects.filter(is_active=True).order_by("-date_joined")[:6]
    return MemberSerializer(result, many=True).data

from collections import defaultdict
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.db.models import Case, When, IntegerField, Value, Count, F
from django.db.models.functions import ExtractYear
from datetime import date



def TotalMembersForSixMonth():
    today = datetime.now()

    six_month_ago = today.replace(day=1) + relativedelta(months=-5)

    base_count = Member.objects.filter(
        is_active=True,
        date_joined__lt=six_month_ago
    ).count()

    monthly_counts = (
        Member.objects.filter(
            is_active=True,
            date_joined__gte=six_month_ago
        )
        .annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    counts_map = {
        row["month"].month: row["count"]
        for row in monthly_counts
    }

    cumulative = base_count
    result = []

    for a in range(5, -1, -1):
        month_date = today.replace(day=1) + relativedelta(months=-a)

        cumulative += counts_map.get(month_date.month, 0)

        result.append({
            "month": time_date.list_month[month_date.month - 1],
            "count": cumulative,
        })

    return result


def TotalChurchForSixYears():
    today = datetime.now()

    six_years_ago = today.replace(month=1, day=1) + relativedelta(years=-5)

    base_count = Church.objects.filter(
        opening_date__lt=six_years_ago
    ).count()

    yearly_counts = (
        Church.objects.filter(
            opening_date__gte=six_years_ago
        )
        .annotate(year=TruncYear("opening_date"))
        .values("year")
        .annotate(count=Count("id"))
        .order_by("year")
    )

    counts_map = {
        row["year"].year: row["count"]
        for row in yearly_counts
    }

    cumulative = base_count
    result = []

    for a in range(5, -1, -1):
        year = today.year - a

        cumulative += counts_map.get(year, 0)

        result.append({
            "years": year,
            "count": cumulative,
        })

    return result


def TotalMinistersForSixMonth():
    today = datetime.now()
    start_date = today.replace(day=1) + relativedelta(months=-5)

    queryset = (
        Member.objects.filter(
            date_joined__gte=start_date,
            is_active=True,
            status="Ministre"
        )
        .annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # convert to dict for fast lookup
    data_map = {item["month"].month: item["count"] for item in queryset}

    result = []
    cumulative = 0

    for i in range(5, -1, -1):
        month_date = today.replace(day=1) + relativedelta(months=-i)
        month_num = month_date.month

        cumulative += data_map.get(month_num, 0)

        result.append({
            "month": time_date.list_month[month_num - 1],
            "count": cumulative
        })

    return result


def TotalEventsForSixMonth():
    today = datetime.now()
    start_date = today.replace(day=1) + relativedelta(months=-5)

    queryset = (
        Event.objects.filter(event_date__gte=start_date)
        .annotate(month=TruncMonth("event_date"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    data_map = {item["month"].month: item["count"] for item in queryset}

    result = []

    for i in range(5, -1, -1):
        month_date = today.replace(day=1) + relativedelta(months=-i)

        result.append({
            "month": time_date.list_month[month_date.month - 1],
            "count": data_map.get(month_date.month, 0)
        })

    return result


def totalEventsCount():
    return Event.objects.only("id").count()


def demographicsStatut():
    base = Member.objects.filter(is_active=True)

    status_data = (
        base.values("status")
        .annotate(count=Count("id"))
    )

    status_map = {item["status"]: item["count"] for item in status_data}

    ministers = status_map.get("Ministre", 0)
    workers = status_map.get("Ouvrier", 0)
    members = status_map.get("Membre", 0)
    visitor = status_map.get("Visiteur", 0)

    total = ministers + workers + members + visitor

    def pct(value):
        return round((value / total) * 100) if total else 0

    return [
        {"title": "Ministres", "count": ministers, "percentage": pct(ministers)},
        {"title": "Ouvriers", "count": workers, "percentage": pct(workers)},
        {"title": "Membres", "count": members, "percentage": pct(members)},
        {"title": "Visiteurs", "count": visitor, "percentage": pct(visitor)},
    ]
    
    

def demographicsGender():
    base = Member.objects.filter(is_active=True)

    data = base.values("gender").annotate(count=Count("id"))

    gender_map = {d["gender"]: d["count"] for d in data}

    men = gender_map.get("H", 0)
    women = gender_map.get("F", 0)

    total = men + women

    def pct(v):
        return round((v / total) * 100) if total else 0

    return [
        {"title": "Hommes", "count": men, "percent": pct(men)},
        {"title": "Femmes", "count": women, "percent": pct(women)},
    ]

def demographicsProfessions():
    base = Member.objects.filter(is_active=True)

    data = (
        base.values("profession_type")
        .annotate(count=Count("id"))
    )

    data_map = {d["profession_type"]: d["count"] for d in data}

    professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]

    total = sum(data_map.values())

    return [
        {
            "title": p,
            "count": data_map.get(p, 0),
            "percent": round((data_map.get(p, 0) / total) * 100) if total else 0
        }
        for p in professions
    ]
    
    
def demographicsStatutM():
    base = Member.objects.filter(is_active=True)

    data = base.values("marital_status").annotate(count=Count("id"))

    data_map = {d["marital_status"]: d["count"] for d in data}

    mapping = {
        "M": "Marie",
        "C": "Celibataire",
        "V": "Veuf(ve)"
    }

    total = sum(data_map.values())

    return [
        {
            "title": mapping[k],
            "count": data_map.get(k, 0),
            "percent": round((data_map.get(k, 0) / total) * 100) if total else 0
        }
        for k in mapping
    ]
    
    


def AgeRangeCount():
    today = date.today()

    qs = Member.objects.filter(is_active=True)

    # age in years computed in DB
    qs = qs.annotate(
        age=today.year - ExtractYear("birthdate")
    )

    qs = qs.aggregate(
        enfants=Count(Case(When(age__lt=13, then=1), output_field=IntegerField())),
        ados=Count(Case(When(age__gte=13, age__lt=20, then=1), output_field=IntegerField())),
        jeune=Count(Case(When(age__gte=20, age__lt=35, then=1), output_field=IntegerField())),
        adultes=Count(Case(When(age__gte=35, age__lt=50, then=1), output_field=IntegerField())),
        agees=Count(Case(When(age__gte=50, then=1), output_field=IntegerField())),
    )

    total = sum(qs.values())

    def pct(v):
        return round((v / total) * 100) if total else 0

    return [
        {"title": "Enfants", "count": qs["enfants"], "percent": pct(qs["enfants"])},
        {"title": "Ados", "count": qs["ados"], "percent": pct(qs["ados"])},
        {"title": "Jeune", "count": qs["jeune"], "percent": pct(qs["jeune"])},
        {"title": "Adultes", "count": qs["adultes"], "percent": pct(qs["adultes"])},
        {"title": "Agees", "count": qs["agees"], "percent": pct(qs["agees"])},
    ]
    
    
    
def YearTraffic():
    month_data = [0] * 12
    result = {}

    try:
        qs = Event_stats.objects.all().order_by(
            "year", "month", "church_id", "event_type_name"
        )
    except (ProgrammingError, OperationalError):
        return {}

    if not qs.exists():
        return {}

    oldest_event_stat = qs.order_by("year").values_list("year", flat=True).first()

    for ev in qs.iterator():  # 🔥 important improvement
        year_key = str(ev.year)

        if year_key not in result:
            result[year_key] = []

        found_event = next(
            (e for e in result[year_key] if e["event"] == ev.event_type_name),
            None,
        )

        if not found_event:
            found_event = {
                "event": ev.event_type_name,
                "data": month_data.copy(),
            }
            result[year_key].append(found_event)

        month_index = int(ev.month) - 1
        current_value = found_event["data"][month_index] or 0
        found_event["data"][month_index] = current_value + int(ev.totals)

    return {"year": oldest_event_stat, **result}


# def YearTraffic():

#     qs = Event_stats.objects.all()

#     if not qs.exists():
#         return {}

#     qs = qs.values(
#         "year",
#         "event_type_name",
#         "month"
#     ).annotate(
#         total=Sum("totals")
#     ).order_by("year", "event_type_name", "month")

#     result = {}

#     for row in qs:
#         year = str(row["year"])
#         event = row["event_type_name"]
#         month = int(row["month"]) - 1

#         if year not in result:
#             result[year] = {}

#         if event not in result[year]:
#             result[year][event] = [0] * 12

#         result[year][event][month] += int(row["total"])

#     return result
