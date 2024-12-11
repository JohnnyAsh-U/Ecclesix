from members.models import Member
from members.serializers import MemberSerializer
from event.models import Event, Event_stats
from church.models import Church
from backend.utils import time_date
from datetime import date, datetime
from dateutil.relativedelta import *
from functools import reduce
# from django.forms.models import model_to_dict
# from django.db.models import Sum


def lastSixMembers():
    result = Member.objects.filter(is_active=True).order_by("-date_joined")[:6]
    return MemberSerializer(result, many=True).data


def TotalMembersForSixMonth():
    today = datetime.now()
    result = []

    six_month_ago = today.replace(day=1) + relativedelta(months=-5)

    total_members_six_months_ago = Member.objects.filter(
        date_joined__date__lt=six_month_ago, is_active=True
    ).count()

    cumulativeSum = 0

    for a in range(5, -1, -1):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        end_date = today.replace(day=31) + relativedelta(months=-a)

        count = Member.objects.filter(
            date_joined__date__range=(start_date, end_date), is_active=True
        ).count()

        cumulativeSum += count
        result.append(
            {
                "month": time_date.list_month[start_date.month - 1],
                "count": cumulativeSum + total_members_six_months_ago,
            }
        )
    return result


def TotalChurchForSixYears():
    today = datetime.now()
    result = []

    six_years_ago = today.replace(day=1, month=1) + relativedelta(years=-5)

    total_churches_six_months_ago = Church.objects.filter(
        opening_date__lt=six_years_ago
    ).count()

    cumulativeSum = 0

    for a in range(5, -1, -1):
        start_date = today.replace(day=1, month=1) + relativedelta(years=-a)
        end_date = today.replace(day=31, month=12) + relativedelta(years=-a)

        count = Church.objects.filter(
            opening_date__range=(start_date, end_date)
        ).count()

        cumulativeSum += count
        result.append(
            {
                "years": start_date.year,
                "count": cumulativeSum + total_churches_six_months_ago,
            }
        )
    return result


def TotalMinistersForSixMonth():
    today = datetime.now()
    result = []

    six_month_ago = today.replace(day=1) + relativedelta(months=-5)

    total_ministers_six_months_ago = Member.objects.filter(
        date_joined__date__lt=six_month_ago, is_active=True, status="Ministre"
    ).count()

    cumulativeSum = 0

    for a in range(5, -1, -1):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        end_date = today.replace(day=31) + relativedelta(months=-a)

        count = Member.objects.filter(
            date_joined__date__range=(start_date, end_date),
            is_active=True,
            status="Ministre",
        ).count()

        cumulativeSum += count
        result.append(
            {
                "month": time_date.list_month[start_date.month - 1],
                "count": cumulativeSum + total_ministers_six_months_ago,
            }
        )
    return result


def TotalEventsForSixMonth():
    today = datetime.now()
    result = []

    for a in range(0, 6):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        end_date = today.replace(day=31) + relativedelta(months=-a)

        count = Event.objects.filter(
            event_date__range=(start_date, end_date),
        ).count()

        result.insert(
            0, {"month": time_date.list_month[start_date.month - 1], "count": count}
        )
    return result


def totalEventsCount():
    return Event.objects.count()


def demographicsStatut():
    ministers = Member.objects.filter(is_active=True, status="Ministre").count()

    workers = Member.objects.filter(is_active=True, status="Ouvrier").count()

    members = Member.objects.filter(is_active=True, status="Membre").count()

    visitor = Member.objects.filter(is_active=True, status="Visiteur").count()

    inactive = Member.objects.filter(
        is_active=False,
    ).count()

    total = ministers + workers + members + visitor

    result = [
        {
            "title": "Ministres",
            "count": ministers,
            "percentage": round((ministers / total) * 100),
        },
        {
            "title": "Ouvriers",
            "count": workers,
            "percentage": round((workers / total) * 100),
        },
        {
            "title": "Membres",
            "count": members,
            "percentage": round((members / total) * 100),
        },
        {
            "title": "Visiteurs",
            "count": visitor,
            "percentage": round((visitor / total) * 100),
        },
        {
            "title": "Inactif",
            "count": inactive,
            "percentage": round((inactive / (total + inactive)) * 100),
        },
    ]

    return result


def demographicsGender():

    men = Member.objects.filter(is_active=True, gender="H").count()
    women = Member.objects.filter(is_active=True, gender="F").count()

    total = men + women

    result = [
        {"title": "Hommes", "count": men, "percent": round((men / total) * 100)},
        {"title": "Femmes", "count": women, "percent": round((women / total) * 100)},
    ]

    return result


def demographicsProfessions():
    professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]
    result = []
    all_member = Member.objects.filter(is_active=True).count()

    for profession in professions:
        member_by_profession = Member.objects.filter(
            is_active=True, profession_type=profession
        ).count()

        percent = (
            round((member_by_profession / all_member) * 100) if all_member != 0 else 0
        )

        result.append(
            {
                "title": profession,
                "count": member_by_profession,
                "percent": percent,
            }
        )
    return result


def demographicsStatutM():
    m_status = [
        {"statut": "Marie", "tag": "M"},
        {"statut": "Celibataire", "tag": "C"},
        {"statut": "Veuf(ve)", "tag": "V"},
    ]
    result = []
    all_member = Member.objects.filter(is_active=True).count()

    for s in m_status:
        member_by_status = Member.objects.filter(
            is_active=True, marital_status=s["tag"]
        ).count()

        percent = round((member_by_status / all_member) * 100) if all_member != 0 else 0

        result.append(
            {"title": s["statut"], "count": member_by_status, "percent": percent}
        )
    return result


def AgeRangeCount():
    age_range = [
        {"category": "Enfants", "range": "<13"},
        {"category": "Ados", "range": "13-20"},
        {"category": "Jeune", "range": "20-35"},
        {"category": "Adultes", "range": "35-50"},
        {"category": "Agees", "range": ">50"},
    ]
    result = []

    all_member = Member.objects.filter(is_active=True).count()

    for r in age_range:
        count = Member.objects.filter(
            is_active=True,
            birthdate__range=time_date.age_range_to_year_range(r["range"]),
        ).count()

        percent = round((count / all_member) * 100) if all_member != 0 else 0

        result.append(
            {
                "title": r["category"],
                "range": r["range"],
                "percent": percent,
                "count": count,
            }
        )

    return result


def YearTraffic():
    month_data = [None for a in range(0, 12)]
    result = {}

    totalEvent = Event_stats.objects.all()

    if totalEvent.count() == 0:
        return {}

    oldest_event_stat =reduce(lambda x,y: min(x,y), [ev.year for ev in totalEvent])

    for ev in totalEvent:
        event_by_year = result.get(ev.year, None)
        if not event_by_year:
            result[ev.year] = []

        found_event = next(
            (event for event in result[ev.year] if event['id'] == ev.pk),
            None,
        )

        if not found_event:
            result[ev.year].append(
                {"id": ev.pk, "event": ev.event_type_name, "data": [*month_data]}
            )

            found_event = next(
                (event for event in result[ev.year] if event['id'] == ev.pk),
                None,
            )

        found_event["data"][int(ev.month)-1] = int(ev.totals)

    return {"year": oldest_event_stat, **result}
