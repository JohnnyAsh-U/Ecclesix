from rest_framework import serializers
from .models import MediaFile


class MediaFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    file_name = serializers.CharField(source='file.name', read_only=True)

    class Meta:
        model = MediaFile
        fields = ('id', 'media_type', 'title', 'file', 'file_name', 'file_size', 'uploaded_by', 'uploaded_at', 'url')
        read_only_fields = ('id', 'file_size', 'uploaded_by', 'uploaded_at', 'url', 'file_name')

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            try:
                if request is not None:
                    return request.build_absolute_uri(obj.file.url)
            except Exception:
                return obj.file.url
        return ''
