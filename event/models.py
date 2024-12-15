from django.db import models


class Event_Type(models.Model):
    event_type_name = models.CharField("event type name", max_length=50, unique=True)
    weekly_event = models.BooleanField("weekly event", default=False)

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
    total = models.IntegerField("total")
    church = models.ForeignKey("church.Church", on_delete=models.CASCADE)

    class Meta:
        verbose_name = "event"
        verbose_name_plural = "events"
        default_permissions = ()
        unique_together = ["event_date", "event_type", "church"]
        permissions = [
            ("ajouter_evenement", "Ajouter Evenement"),
            ("modifier_evenement", "Modifier Evenement"),
            ("voir_evenement", "Voir Evenement"),
            ("voir_touts_evenements", "Voir Touts Les Evenements"),
            ("supprimer_evenement", "Supprimer Evenement"),
        ]


class Event_stats(models.Model):
    event_type_name = models.CharField(max_length=20)
    month = models.CharField("month", max_length=50)
    year = models.CharField("year", max_length=50)
    church_id = models.CharField("church", max_length=50)
    totals = models.CharField("total", max_length=50)
    average = models.CharField("average", max_length=50)

    class Meta:
        verbose_name = "event_stat"
        verbose_name_plural = "event_stats"
        default_permissions = ()
        managed = False
        db_table = "events_stats"
        
        


# This is the sql for the event_stat view for sqlite3

# CREATE VIEW events_stats AS
# SELECT event_event_type.id, event_event_type.event_type_name, month(event_event.event_date) AS month, year(event_event.event_date) AS year, event_event.church_id, SUM(event_event.total) AS totals, ROUND(AVG(event_event.total), 0) AS average
# FROM event_event_type
# JOIN event_event ON event_event_type.id = event_event.event_type_id
# WHERE event_event_type.weekly_event = True
# GROUP BY month(event_event.event_date), year( event_event.event_date), event_event_type.id,
# event_event.church_id
# ORDER BY event_event_type.id, event_event.church_id, MONTH, YEAR
