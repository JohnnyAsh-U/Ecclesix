from storages.backends.s3boto3 import S3Boto3Storage
from django.db import connection



class TenantMediaStorage(S3Boto3Storage):
    @property
    def location(self):
        schema = connection.schema_name
        if schema == 'public':
            return 'public-media'
        return f'medias/{schema}'