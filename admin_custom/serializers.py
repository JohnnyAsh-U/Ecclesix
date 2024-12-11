from rest_framework import serializers
from .models import Log


class LogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Log
        fields = "__all__"
        
    def get_admin_name(self, obj):
        if obj.admin:
            return {"id": obj.admin.id, "name": obj.admin.get_full_name()}
        return None
