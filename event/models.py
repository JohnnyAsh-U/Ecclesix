from django.db import models


class Event_Type(models.Model):
    event_type_name = models.CharField('event type name', max_length=50, unique=True)
    weekly_event = models.BooleanField('weekly event',default=False)
    
    class Meta:
        verbose_name = "event_type"
        verbose_name_plural = "event_types"
        default_permissions = ()
        

class Event(models.Model):
    event_name = models.CharField('event name', max_length=50)
    event_date = models.DateField('event date')
    event_type = models.ForeignKey(Event_Type, on_delete=models.CASCADE)
    men = models.IntegerField('men', default=0)
    women = models.IntegerField('women', default=0)
    children = models.IntegerField('children', default=0)
    total = models.IntegerField('total')
    church = models.ForeignKey('church.Church', on_delete=models.CASCADE)
    
    
    class Meta:
        verbose_name = "event"
        verbose_name_plural = "events"
        default_permissions = ()
        unique_together = ['event_date', 'event_type', 'church']
    