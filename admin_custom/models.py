from django.db import models
from django.contrib.auth.models import Permission
from django.utils import timezone

# Create your models here.


class Role(models.Model):

    role_name = models.CharField(max_length=50)
    description = models.CharField(max_length=200, default="")
    permission = models.ManyToManyField(
        Permission, related_name="role", related_query_name="permission"
    )

    class Meta:
        """Meta definition for Roles."""

        verbose_name = "role"
        verbose_name_plural = "roles"
        default_permissions = ()

    def __str__(self):
        return f"{self.role_name}"



class Log(models.Model):

    log_type = models.CharField(max_length=50)
    detail = models.JSONField("details")
    action_time = models.DateTimeField("action_time", default=timezone.now)
    admin = models.ForeignKey("members.Member", on_delete=models.SET_NULL, null=True)

    class Meta:
        """Meta definition for Logs."""

        verbose_name = "log"
        verbose_name_plural = "logs"
        default_permissions = ()
        permissions = [("voir_adminlog", "Voir Admin Log")]
        

    def __str__(self):
        return f"{self.log_type} | {self.admin.first_name}"
