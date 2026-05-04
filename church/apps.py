from django.apps import AppConfig


class ChurchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'church'

    def ready(self):
        # register signals
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
