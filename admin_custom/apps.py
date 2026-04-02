from django.apps import AppConfig


class AdminCustomConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_custom'

    def ready(self):
        # Avoid database access during app initialization.
        return
