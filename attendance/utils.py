from django.core.signing import BadSignature, Signer
from django.utils import timezone
from datetime import date, datetime
import json
import re

from members.models import Member


signer = Signer()


def parse_bool(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return value == 1

    return str(value).strip().lower() in {"1", "true", "yes", "oui"}


def normalize_gender(value):
    normalized = str(value or "").strip().upper()

    if normalized in {"F", "FEMME", "FEMALE", "WOMAN", "W"}:
        return "F"

    return "H"


def parse_birthdate(value):
    if not value:
        return None

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    raw_value = str(value).strip()
    if not raw_value:
        return None

    try:
        return datetime.fromisoformat(raw_value.replace("Z", "+00:00")).date()
    except ValueError:
        try:
            return date.fromisoformat(raw_value[:10])
        except ValueError:
            return None


def is_minor(birthdate, reference_date):
    if not birthdate:
        return False

    return (reference_date.year - birthdate.year) - (
        (reference_date.month, reference_date.day) < (birthdate.month, birthdate.day)
    ) < 18


def validate_qr(signed_payload):
    if not signed_payload:
        return None

    try:
        unsigned = signer.unsign(str(signed_payload).strip())
        data = json.loads(unsigned)
        member_id = data.get("id")

        if not member_id:
            return None

        return Member.objects.filter(pk=member_id).first()
    except (BadSignature, json.JSONDecodeError, TypeError, ValueError):
        return None


def resolve_member_from_identity(first_name, last_name, phone, church_id):
    queryset = Member.objects.filter(church_id=church_id)

    if phone:
        member = queryset.filter(phone=phone).first()
        if member:
            return member

    if first_name and last_name:
        return queryset.filter(
            first_name__iexact=first_name,
            last_name__iexact=last_name,
        ).first()

    return None


def create_visitor_member(first_name, last_name, phone, church_id, gender=None, birthdate=None):
    normalized_first_name = (first_name or "Visiteur").strip() or "Visiteur"
    normalized_last_name = (last_name or "Mobile").strip() or "Mobile"
    normalized_phone = (phone or "").strip() or None
    normalized_birthdate = parse_birthdate(birthdate)
    normalized_gender = normalize_gender(gender)
   
    return Member.objects.create_user(
        first_name=normalized_first_name,
        last_name=normalized_last_name,
        phone=normalized_phone,
        gender=normalized_gender,
        birthdate=normalized_birthdate,
        church_id=church_id,
        status="Visiteur",
    )


def update_event_attendance_totals(event, member, birthdate=None, gender=None):
    member_birthdate = parse_birthdate(birthdate) or getattr(member, "birthdate", None)
    member_gender = normalize_gender(gender or getattr(member, "gender", None))
    fields_to_update = ["total"]

    event.total = (event.total or 0) + 1

    if is_minor(member_birthdate, event.event_date):
        event.children = (event.children or 0) + 1
        fields_to_update.append("children")
    elif member_gender == "F":
        event.women = (event.women or 0) + 1
        fields_to_update.append("women")
    else:
        event.men = (event.men or 0) + 1
        fields_to_update.append("men")

    event.save(update_fields=fields_to_update)
    
    
def get_member_by_id(id):
    if not id:
        return None

    try:
        return Member.objects.get(pk=id)
    except Member.DoesNotExist:
        return None
