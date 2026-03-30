from members.models import Member
from event.models import Event, Event_Type, Event_stats
from .models import Church
from backend.utils import time_date
from datetime import date, datetime
from dateutil.relativedelta import *
from django.forms.models import model_to_dict
from django.db.models import Sum
from functools import reduce


def TotalMembersForSixMonth(id):
    today = datetime.now()
    result = []

    for a in range(5, -1, -1):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        # end_date = today.replace(day=31) + relativedelta(months=-a)
        end_date = today + relativedelta(day=31, months=-a)


        count = Member.objects.filter(
            church=id, date_joined__date__range=(start_date, end_date), is_active=True
        ).count()

        result.append(
            {"month": time_date.list_month[start_date.month - 1], "count": count}
        )
    return result


def TotalEventsForSixMonth(id):
    today = datetime.now()
    result = []

    for a in range(0, 6):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        # end_date = today.replace(day=31) + relativedelta(months=-a)
        end_date = today + relativedelta(day=31, months=-a)


        count = Event.objects.filter(
            church=id,
            event_date__range=(start_date, end_date),
        ).count()

        result.insert(
            0, {"month": time_date.list_month[start_date.month - 1], "count": count}
        )
    return result


def TotalAttendanceForSixMonth(id):
    today = datetime.now()
    result = []

    for a in range(0, 6):
        start_date = today.replace(day=1) + relativedelta(months=-a)
        # end_date = today.replace(day=31) + relativedelta(months=-a)
        end_date = today + relativedelta(day=31, months=-a)


        count = Event.objects.filter(
            church=id,
            event_date__range=(start_date, end_date),
        )

        count = Event.objects.filter(
            church=id, event_date__range=(start_date, end_date)
        ).aggregate(Sum("total"))

        total_sum = count["total__sum"]

        result.insert(
            0,
            {
                "month": time_date.list_month[start_date.month - 1],
                "count": total_sum if total_sum != None else 0,
            },
        )
    return result


def AgeRangeCount(id):
    age_range = [
        {"category": "Enfants", "range": "<13"},
        {"category": "Ados", "range": "13-20"},
        {"category": "Jeune", "range": "20-35"},
        {"category": "Adultes", "range": "35-50"},
        {"category": "Agees", "range": ">50"},
    ]
    result = []

    for r in age_range:
        count = Member.objects.filter(
            church=id,
            is_active=True,
            birthdate__range=time_date.age_range_to_year_range(r["range"]),
        ).count()

        result.append({"categorie": r["category"], "count": count})

    return result


def AttendanceMonthGraph(id):
    today = date.today()
    month = today.month
    year = today.year
    results = {}
    for m in range(1, month + 1, 3):
        start_date = today.replace(month=m, day=1)
        start_date_week = start_date + relativedelta(weekday=MO(-1))

        end_date = today.replace(month=m, day=1) + relativedelta(months=+2, day=31)
        end_date_week = end_date + relativedelta(weekday=SU(+1))

        event_types = Event_Type.objects.all()

        start_dt = start_date_week

        period = []
        weeks = []

        # to print each week interval for the month interval
        while start_dt.isocalendar()[1] != end_date_week.isocalendar()[1] + 1:
            start_period = f"{start_dt.day} {time_date.month_abbr[start_dt.month-1]}"

            # to get the week end
            end_date = start_dt + relativedelta(weekday=SU(+1))
            end_period = f"{end_date.day} {time_date.month_abbr[end_date.month-1]}"

            # append the week start to weeks and period to period
            weeks.append(start_dt)
            period.append(start_period + "-" + end_period)

            start_dt = start_dt + relativedelta(weeks=+1)

        events = []

        for ev in event_types:
            totals = []
            label = ev.event_type_name

            events_of_ev: list[Event] = ev.event_set.filter(
                church=id, event_date__range=(start_date_week, end_date_week)
            )

            # use the week start list to arrange the events by week
            for week in weeks:
                # events_of_ev.
                found_event = next(
                    (
                        event
                        for event in events_of_ev
                        if event.event_date.isocalendar()[1] == week.isocalendar()[1]
                    ),
                    None,
                )
                totals.append(found_event.total) if found_event else totals.append(None)

            events.append({"label": ev.event_type_name, "totals": totals})

        results[f"{m-1}-{m+1}"] = {"period": period, "events": events}

    return results


def AttendanceYearGraph(id):
    month_data = [0 for a in range(0, 12)]
    result = {}

    totalEvent = Event_stats.objects.filter(church_id=id)
        
    if totalEvent.count() == 0:
        return {}
    
    oldest_event_stat =reduce(lambda x,y: min(x,y), [ev.year for ev in totalEvent])

    for ev in totalEvent:
        event_by_year = result.get(str(ev.year), None)
        if not event_by_year:
            result[str(ev.year)] = []

        found_event = next(
            (event for event in result[str(ev.year)] if event['id'] == ev.pk),
            None,
        )

        if not found_event:
            result[str(ev.year)].append(
                {"id": ev.pk, "event": ev.event_type_name, "data": [*month_data]}
            )
            
            found_event = next(
                (event for event in result[str(ev.year)] if event['id'] == ev.pk),
                None,
            )
        
        found_event["data"][int(ev.month)-1] = ev.average

    return {"year": oldest_event_stat, **result}


def Professions(id):
    professions = ["Travailleur", "Entrepreneur", "Eleve/Etudiant", "Autres"]
    result = []
    all_member = Member.objects.filter(church=id, is_active=True).count()

    for profession in professions:
        member_by_profession = Member.objects.filter(
            church=id, is_active=True, profession_type=profession
        ).count()

        percent = (
            int((member_by_profession / all_member) * 100) if all_member != 0 else 0
        )

        result.append(
            {
                "profession": profession,
                "count": member_by_profession,
                "percent": percent,
            }
        )
    return result


def Marital_Status(id):
    m_status = [
        {"statut": "Marie", "tag": "M"},
        {"statut": "Celibataire", "tag": "C"},
        {"statut": "Veuf(ve)", "tag": "V"},
    ]
    result = []
    all_member = Member.objects.filter(church=id, is_active=True).count()

    for s in m_status:
        member_by_status = Member.objects.filter(
            church=id, is_active=True, marital_status=s["tag"]
        ).count()

        percent = int((member_by_status / all_member) * 100) if all_member != 0 else 0

        result.append(
            {"statut": s["statut"], "count": member_by_status, "percent": percent}
        )
    return result


def Gender(id):
    sex = [
        {"sexe": "Homme", "tag": "H"},
        {"sexe": "Femme", "tag": "F"},
    ]
    result = []
    all_member = Member.objects.filter(church=id, is_active=True).count()

    for s in sex:
        member_by_gender = Member.objects.filter(
            church=id, is_active=True, gender=s["tag"]
        ).count()

        percent = int((member_by_gender / all_member) * 100) if all_member != 0 else 0

        result.append(
            {
                "sexe": s["sexe"],
                "count": member_by_gender,
                "percent": percent,
            }
        )
    return result
