from rest_framework import serializers
from .models import Log, Role
from members.models import Member
from church.models import Church


class LogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Log
        fields = "__all__"
        
    def get_admin_name(self, obj):
        if obj.admin:
            return {"id": obj.admin.id, "name": obj.admin.get_full_name()}
        return None
    
    
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"
        
        
class AdminMemberSerializer(serializers.ModelSerializer):
    role = serializers.StringRelatedField()
    church = serializers.StringRelatedField()
    class Meta:
        model = Member
        fields = [
            "id",
            "email",
            "phone",
            "get_full_name",
            "last_login",
            "date_joined",
            "role",
            "church",
            "is_admin",
            "is_superuser"
        ]
        
class SimpleChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields  = ['id', 'church_name']
