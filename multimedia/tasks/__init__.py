import dramatiq

from backend import settings
from multimedia.models import MediaFile
import tempfile, os
from ..services.s3 import s3_client
from ..services.validation import validate_mime_type, validate_image_dimentsions, scan_file, sanitize_image


@dramatiq.actor(queue_name="scan_uploaded_media")
def scan_uploaded_media(media_id):
    media = MediaFile.objects.get(id=media_id)
    
    fd, temp_path = tempfile.mkstemp()
    
    os.close(fd)
    try:
        s3_client.download_file(
            settings.AWS_STORAGE_BUCKET_NAME,
            media.file,
            temp_path
        )
        validate_mime_type(temp_path)
        if media.media_type == MediaFile.MediaType.IMAGE:
            validate_image_dimentsions(temp_path)
            
        scan_file(temp_path)
        final_path = temp_path + "_clean"
        if media.media_type == MediaFile.MediaType.IMAGE:
            sanitize_image(temp_path, final_path)
        else: 
            final_path = temp_path
            
        clean_key = media.file.replace(
            "quarantine/",
            "medias/"
        )
        
        s3_client.upload_file(
            final_path,
            settings.AWS_STORAGE_BUCKET_NAME,
            clean_key,
            # ExtraArgs={
            #     "ContentType": media.mime_type
            # }
        )
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=media.file
        )
        media.file = clean_key
        media.status = MediaFile.Status.READY
        media.scan_result = "clean"
        media.save(
            update_fields = [
                "file"
                "status",
                "scan_result"
            ]
        )
    except Exception as e:
        media.status = MediaFile.Status.INFECTED
        media.scan_result = str(e)
        media.save(
            update_fields=[
                "status",
                "scan_result",
            ]
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)