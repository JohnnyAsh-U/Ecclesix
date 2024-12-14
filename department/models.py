from django.db import models
from django.utils import timezone
from church.models import Church
from members.models import Member


class Department(models.Model):

    department_name = models.CharField(max_length=50)
    description = models.TextField()
    church = models.ForeignKey(
        Church,
        related_name="departments",
        related_query_name="church_department",
        on_delete=models.CASCADE,
    )
    department_head = models.ForeignKey(
        Member,
        related_name="deps",
        related_query_name="dep_head",
        on_delete=models.SET_NULL,
        null= True,
        blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    member = models.ManyToManyField(
        Member, related_name="departments", related_query_name="member"
    )

    class Meta:
        """Meta definition for Department."""

        verbose_name = "department"
        verbose_name_plural = "departments"
        default_permissions = ()
        permissions = [
            ("ajouter_departement", "Ajouter Departement"),
            ("modifier_departement", "Modifier Departement"),
            ("voir_departement", "Voir Departement"),
            ("voir_touts_departements", "Voir Touts Les Departements"),
            ("supprimer_departement", "Supprimer Departements"),
            ("chef_departement", "Chef Departement"),
        ]

    def __str__(self):
        return f"{self.department_name}"
