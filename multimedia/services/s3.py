import boto3
from django.conf import settings

s3_client = boto3.client('s3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME,
    endpoint_url=settings.AWS_S3_ENDPOINT_URL
)


def generate_presigned_upload_url(object_key, content_type):
    try:
        response = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 
                'Key': object_key,
                'ContentType': content_type
            },
            ExpiresIn=3600,
        )
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None

    return response