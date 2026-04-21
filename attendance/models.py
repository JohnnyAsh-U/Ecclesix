from django.db import models
from django.utils import timezone


class Attendance(models.Model):
    member = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    event_type = models.ForeignKey(
        "event.Event_Type",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    church = models.ForeignKey(
        "church.Church",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    date = models.DateField("date")
    arrival_time = models.TimeField("arrival time", null=True, blank=True)
    created_by = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        related_name="recorded_attendances",
    )
    notes = models.CharField("notes", max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "attendance"
        verbose_name_plural = "attendances"
        default_permissions = ()
        unique_together = ["member", "event_type", "date", "church"]
        indexes = [
            models.Index(fields=["church", "date"]),
            models.Index(fields=["church", "event_type", "date"]),
            models.Index(fields=["member", "church", "date"]),
        ]

    def __str__(self):
        return f"{self.member} - {self.event_type} ({self.date})"
