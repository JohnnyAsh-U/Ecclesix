from django.apps import AppConfig
import sys


class AdminCustomConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_custom'

    def ready(self):
        if any(cmd in sys.argv for cmd in {"makemigrations", "migrate", "collectstatic", "test"}):
            return

        from .services import load_app_configs_to_cache

        load_app_configs_to_cache()
