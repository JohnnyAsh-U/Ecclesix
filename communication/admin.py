from django.contrib import admin
from .models import CommunicationLog


@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ("id", "channel", "created_by", "recipients_count", "success_count", "failed_count", "created_at")
    list_filter = ("channel", "created_at")
    search_fields = ("subject", "message")
