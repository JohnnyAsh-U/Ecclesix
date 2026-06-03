from django.db import connection, models
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F
from django_tenants.utils import schema_context
from event.models import Event
from storages.backends.s3boto3 import S3Boto3Storage

from members.models import Member
from church.models import Church
from tenants.models import TenantStorageQuota
from .storage import TenantMediaStorage

# Create your models here.

# Médiathèque — new
class MediaFile(models.Model):
    class MediaType(models.TextChoices):
        AUDIO = 'audio', 'Audio'
        VIDEO = 'video', 'Vidéo'
        IMAGE = 'image', 'Image'
        DOCUMENT = 'document', 'Document'
        
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        SCANNING = 'scanning', 'En cours de scan'
        READY = 'ready', 'Prêt'
        ERROR = 'error', 'Erreur'
        REJECTED = 'rejected', 'Rejeté'
        INFECTED = 'infected', 'Infecté'

    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, related_name='media')
    media_type = models.CharField(max_length=20, choices=MediaType.choices, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    church = models.ForeignKey(Church, on_delete=models.SET_NULL, null=True, related_name='media_files')
    object_key = models.CharField(max_length=500, null=True, blank=True)
    file = models.FileField(storage=TenantMediaStorage())
    file_size = models.BigIntegerField(null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    scan_result = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.file:
            file_size = self.file.size

            prev_size = 0
            if self.pk:
                try:
                    prev = self.__class__.objects.get(pk=self.pk)
                    prev_size = prev.file_size or 0
                except Exception:
                    prev_size = 0

            delta = file_size - (prev_size or 0)

            if delta > 0:
                current_schema = connection.schema_name
                with schema_context('public'):
                    with transaction.atomic():
                        try:
                            quota = TenantStorageQuota.objects.select_for_update().get(
                                tenant__schema_name=current_schema
                            )
                            if quota.used_bytes + delta > quota.quota_bytes:
                                raise ValidationError("Quota exceeded")
                            quota.used_bytes = F('used_bytes') + delta
                            quota.save()
                        except TenantStorageQuota.DoesNotExist:
                            # Quota not configured for this tenant; allow save to proceed
                            pass

            # store file_size on the model
            self.file_size = file_size

        super().save(*args, **kwargs)
        
    class Meta:
        verbose_name = "media file"
        verbose_name_plural = "media files"
        default_permissions = ()
        permissions = [
            ("ajouter_mediafile", "Ajouter MediaFile"),
            ("voir_mediafile", "Voir MediaFile"),
            ("voirs_touts_mediafiles", "Voir tous les MediaFiles"),
            ("supprimer_mediafile", "Supprimer MediaFile"),
        ]
        indexes = [
            models.Index(fields=['church', 'media_type']),
            models.Index(fields=['-uploaded_at'])
        ]