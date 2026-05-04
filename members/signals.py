from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import connection
from django.db.models import F
from .models import Member
from tenants.models import Tenant


def _update_tenant_counter(field_name, delta=1):
    schema = getattr(connection, "schema_name", None)
    if not schema or schema == "public":
        return
    Tenant.objects.filter(schema_name=schema).update(**{field_name: F(field_name) + delta})


@receiver(post_save, sender=Member)
def member_post_save(sender, instance, created, **kwargs):
    if created:
        _update_tenant_counter("member_count", 1)


@receiver(post_delete, sender=Member)
def member_post_delete(sender, instance, **kwargs):
    _update_tenant_counter("member_count", -1)
