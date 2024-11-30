from django.db import models
from members.models import Member


class City(models.Model):
    city_name = models.CharField("city_name", max_length=50)

    class Meta:
        verbose_name = "City"
        verbose_name_plural = "Cities"

    def __str__(self):
        return f"{self.city_name}"


class Church_type(models.Model):
    church_type_name = models.CharField("church_type_name", max_length=50)
    description = models.CharField("description", max_length=255)

    class Meta:
        verbose_name = "Church_type"
        verbose_name_plural = "Church_types"

    def __str__(self):
        f"{self.church_type_name}"


class Church(models.Model):
    church_name = models.CharField("church_name", max_length=50)
    address = models.CharField("location", max_length=100)
    opening_date = models.DateField("date_opened")

    city = models.ForeignKey(
        City,
        related_name="city_church",
        related_query_name="city",
        on_delete=models.SET_NULL,
        null=True
    )
    type = models.ForeignKey(
        Church_type,
        related_name="type_church",
        related_query_name="type",
        on_delete=models.SET_NULL,
        null=True
    )
    leader = models.ForeignKey(
        Member,
        related_name="leader_church",
        related_query_name="leader",
        on_delete=models.SET_NULL,
        null=True
    )
    leader2 = models.ForeignKey(
        Member,
        related_name="leader2_church",
        related_query_name="leader2",
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        verbose_name = "Church"
        verbose_name_plural = "Churches"

    def __str__(self):
        return f"{self.church_name}"
