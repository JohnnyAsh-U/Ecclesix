from django.db import models
from django.utils import timezone


class Event_Type(models.Model):
    DAY_OF_WEEK_CHOICES = (
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    )

    event_type_name = models.CharField("event type name", max_length=50, unique=True)
    start_time = models.TimeField("start time", null=True, blank=True)
    end_time = models.TimeField("end time", null=True, blank=True)
    weekly_event = models.BooleanField("weekly event", default=False)
    event_day_of_week = models.PositiveSmallIntegerField(
        "event day of week",
        choices=DAY_OF_WEEK_CHOICES,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "event_type"
        verbose_name_plural = "event_types"
        default_permissions = ()
        
    def __str__(self):
        return f"{self.event_type_name}"


class Event(models.Model):
    event_name = models.CharField("event name", max_length=50, null=True, blank=True)
    event_date = models.DateField("event date")
    event_type = models.ForeignKey(Event_Type, on_delete=models.CASCADE)
    men = models.IntegerField("men", default=0)
    women = models.IntegerField("women", default=0)
    children = models.IntegerField("children", default=0)
    total = models.IntegerField("total", default=0)
    church = models.ForeignKey("church.Church", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "event"
        verbose_name_plural = "events"
        default_permissions = ()
        unique_together = ["event_date", "event_type", "church"]
        indexes = [
            models.Index(fields=["church", "event_date"]),
        ]
        permissions = [
            ("ajouter_evenement", "Ajouter Evenement"),
            ("modifier_evenement", "Modifier Evenement"),
            ("voir_evenement", "Voir Evenement"),
            ("voir_touts_evenements", "Voir Touts Les Evenements"),
            ("supprimer_evenement", "Supprimer Evenement"),
        ]
        
    def __str__(self):
        return f"{self.event_date}"


class Event_stats(models.Model):
    id = models.BigIntegerField(primary_key=True)
    event_type_name = models.CharField(max_length=50)
    month = models.PositiveSmallIntegerField("month")
    year = models.PositiveIntegerField("year")
    church_id = models.IntegerField("church")
    totals = models.IntegerField("total")
    average = models.IntegerField("average")

    class Meta:
        verbose_name = "event_stat"
        verbose_name_plural = "event_stats"
        default_permissions = ()
        managed = False
        db_table = "events_stats"
        ordering = ["year", "month", "church_id", "event_type_name"]


