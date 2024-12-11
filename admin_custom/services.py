from datetime import datetime
from .models import Log
from dateutil.parser import parse
from django.utils import timezone


def ViewLogger(admin_id, detail={}):
    now = timezone.now()

    # we get the previous view log
    prev = (
        Log.objects.filter(log_type="VIEW", admin_id=admin_id, detail=detail)
        .order_by("-action_time")
        .first()
    )
    # check if the last view object is less than 15mins
    time_diff = (now.timestamp() - prev.action_time.timestamp()) / 60 if prev else None

    if not prev or time_diff > 15:
        Log.objects.create(admin_id=admin_id, log_type="VIEW", detail=detail)
