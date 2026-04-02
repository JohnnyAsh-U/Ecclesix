from datetime import datetime
from .models import Log
from dateutil.parser import parse
from django.utils import timezone
from django.core.cache import cache
from django.db.utils import OperationalError, ProgrammingError
from .models import Appconfig
from .constant import APP_CONFIG_CACHE_KEY, CHURCH_NAME_KEY




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


def load_app_configs_to_cache(force=False):
    cached = cache.get(APP_CONFIG_CACHE_KEY)
    if cached is not None and not force:
        return cached

    try:
        configs = list(
            Appconfig.objects.filter(is_active=True).values("config_key", "config_value")
        )
    except (OperationalError, ProgrammingError):
        return {}

    payload = {item["config_key"]: item["config_value"] for item in configs}
    cache.set(APP_CONFIG_CACHE_KEY, payload, timeout=None)
    return payload


def get_app_config(key, default=None):
    configs = load_app_configs_to_cache()
    return configs.get(key, default)
