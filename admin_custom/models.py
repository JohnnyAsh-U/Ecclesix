from django.db import models
from django.contrib.auth.models import Permission

# Create your models here.


class Role(models.Model):

    role_name = models.CharField(max_length=50)
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
