from django.db import OperationalError, ProgrammingError

from members.models import Member
from event.models import Event, Event_Type, Event_stats
from .models import Church
from backend.utils import time_date
from datetime import date, datetime
from dateutil.relativedelta import *
from django.forms.models import model_to_dict
from django.db.models import Sum
from functools import reduce


from django.db.models import Count
from django.db.models.functions import TruncMonth
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.db.models import Count, Q
from datetime import date
from django.db.models import Sum
from datetime import datetime
from dateutil.relativedelta import relativedelta



def TotalMembersForSixMonth(church_id):
    today = datetime.now()
    start_date = today - relativedelta(months=5)
    
    qs = (
        Member.objects
        .filter(
            church=church_id,
            is_active=True,
            date_joined__date__gte=start_date,
            date_joined__date__lte=today,
        )
        .annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    data = {row["month"].month: row["count"] for row in qs}

    return [
        {
            "month": time_date.list_month[m],
            "count": data.get(m + 1, 0)
        }
        for m in range(start_date.month - 1, (start_date.month - 1) + 6)
    ]


def TotalEventsForSixMonth(church_id):
    today = datetime.now()
    start_date = today - relativedelta(months=5)

    qs = (
        Event.objects
        .filter(
            church=church_id,
            event_date__gte=start_date,
            event_date__lte=today,
        )
        .annotate(month=TruncMonth("event_date"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    data = {row["month"].month: row["count"] for row in qs}

    return [
        {
            "month": time_date.list_month[m],
            "count": data.get(m + 1, 0)
        }
        for m in range(start_date.month - 1, (start_date.month - 1) + 6)
    ]



def TotalAttendanceForSixMonth(church_id):
    today = datetime.now()
    start_base = today - relativedelta(months=5)

    qs = (
        Event.objects
        .filter(
            church=church_id,
            event_date__gte=start_base,
            event_date__lte=today,
        )
        .annotate(month=TruncMonth("event_date"))
        .values("month")
        .annotate(total=Sum("total"))
        .order_by("month")
    )

    data = {row["month"].month: row["total"] or 0 for row in qs}

    return [
        {
            "month": time_date.list_month[m],
            "count": data.get(m + 1, 0),
        }
        for m in range(start_base.month - 1, start_base.month - 1 + 6)
    ]


def AgeRangeCount(church_id):
    today = date.today()

    def year_from_age(age):
        return today.year - age

    qs = Member.objects.filter(
        church=church_id,
        is_active=True,
    ).aggregate(
        enfants=Count("id", filter=Q(birthdate__gte=date(year_from_age(13), 1, 1))),
        
        ados=Count("id", filter=Q(birthdate__lt=date(year_from_age(13), 1, 1)) &
                             Q(birthdate__gte=date(year_from_age(20), 1, 1))),

        jeune=Count("id", filter=Q(birthdate__lt=date(year_from_age(20), 1, 1)) &
                              Q(birthdate__gte=date(year_from_age(35), 1, 1))),

        adultes=Count("id", filter=Q(birthdate__lt=date(year_from_age(35), 1, 1)) &
                                Q(birthdate__gte=date(year_from_age(50), 1, 1))),

        agees=Count("id", filter=Q(birthdate__lt=date(year_from_age(50), 1, 1))),
    )

    return [
        {"categorie": "Enfants", "count": qs["enfants"]},
        {"categorie": "Ados", "count": qs["ados"]},
        {"categorie": "Jeune", "count": qs["jeune"]},
        {"categorie": "Adultes", "count": qs["adultes"]},
        {"categorie": "Agees", "count": qs["agees"]},
    ]
from collections import defaultdict
from datetime import date
from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from django.db.models.functions import ExtractWeek


def AttendanceMonthGraph(church_id):
    today = date.today()
    year = today.year
    current_month = today.month

    results = {}

    # cache event types once (NO repeated queries)
    event_types = list(Event_Type.objects.values_list("event_type_name", flat=True))

    for m in range(1, current_month + 1, 3):
        start_date = date(year, m, 1)
        end_date = (start_date + relativedelta(months=3)) - relativedelta(days=1)

        # normalize week range boundaries
        start_week = start_date + relativedelta(weekday=MO(-1))
        end_week = end_date + relativedelta(weekday=SU(+1))

        # 🔥 SINGLE QUERY for all events in range
        rows = (
            Event.objects.filter(
                church=church_id,
                event_date__range=(start_week, end_week),
            )
            .annotate(week=ExtractWeek("event_date"))
            .values("week", "event_type__event_type_name")
            .annotate(total=Sum("total"))
        )

        # index for fast lookup: (event_type, week) → total
        data_map = {
            (r["event_type__event_type_name"], r["week"]): r["total"]
            for r in rows
        }

        # build weeks once (NO event scanning)
        weeks = []
        period = []

        start_dt = start_week

        while start_dt <= end_week:
            week_num = start_dt.isocalendar()[1]

            end_dt = start_dt + relativedelta(weekday=SU(+1))

            weeks.append(week_num)

            period.append(
                f"{start_dt.day} {start_dt.strftime('%b')}-"
                f"{end_dt.day} {end_dt.strftime('%b')}"
            )

            start_dt += relativedelta(weeks=1)

        # build event matrix
        events = []

        for ev_type in event_types:
            totals = [
                data_map.get((ev_type, w)) for w in weeks
            ]

            events.append({
                "label": ev_type,
                "totals": totals
            })

        results[f"{m-1}-{m+1}"] = {
            "period": period,
            "events": events
        }

    return results


from collections import defaultdict


def AttendanceYearGraph(church_id):
    try:
        rows = (
            Event_stats.objects
            .filter(church_id=church_id)
            .values("id", "year", "month", "event_type_name", "average")
            .order_by("year", "month")
        )
    except Exception:
        return {}

    if not rows:
        return {}

    result = defaultdict(lambda: defaultdict(lambda: {
        "event": "",
        "data": [0] * 12
    }))

    years = set()

    for r in rows:
        year = r["year"]
        event = r["event_type_name"]
        month_idx = r["month"] - 1

        years.add(year)

        # initialize once
        if result[year][event]["event"] == "":
            result[year][event]["event"] = event

        # direct index assignment (NO SEARCH)
        result[year][event]["data"][month_idx] = r["average"]

    # convert defaultdict → normal dict
    final = {
        str(year): list(events.values())
        for year, events in result.items()
    }

    return {
        "year": min(years),
        **final
    }
    
    
from django.db.models import Count


def Professions(church_id):
    professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]

    qs = (
        Member.objects
        .filter(church=church_id, is_active=True)
        .values("profession_type")
        .annotate(count=Count("id"))
    )

    data = {r["profession_type"]: r["count"] for r in qs}

    total = sum(data.values())

    result = []
    for p in professions:
        count = data.get(p, 0)
        percent = int((count / total) * 100) if total else 0

        result.append({
            "profession": p,
            "count": count,
            "percent": percent
        })

    return result

def Marital_Status(church_id):
    statuses = [
        {"statut": "Marie", "tag": "M"},
        {"statut": "Celibataire", "tag": "C"},
        {"statut": "Veuf(ve)", "tag": "V"},
    ]

    qs = (
        Member.objects
        .filter(church=church_id, is_active=True)
        .values("marital_status")
        .annotate(count=Count("id"))
    )

    data = {r["marital_status"]: r["count"] for r in qs}

    total = sum(data.values())

    result = []
    for s in statuses:
        count = data.get(s["tag"], 0)
        percent = int((count / total) * 100) if total else 0

        result.append({
            "statut": s["statut"],
            "count": count,
            "percent": percent
        })

    return result



def Gender(church_id):
    genders = [
        {"sexe": "Homme", "tag": "H"},
        {"sexe": "Femme", "tag": "F"},
    ]

    qs = (
        Member.objects
        .filter(church=church_id, is_active=True)
        .values("gender")
        .annotate(count=Count("id"))
    )

    data = {r["gender"]: r["count"] for r in qs}

    total = sum(data.values())

    result = []
    for g in genders:
        count = data.get(g["tag"], 0)
        percent = int((count / total) * 100) if total else 0

        result.append({
            "sexe": g["sexe"],
            "count": count,
            "percent": percent
        })

    return result