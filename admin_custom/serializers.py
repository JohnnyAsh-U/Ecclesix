from rest_framework import serializers
from .models import Log, Role
from members.models import Member
from church.models import Church
from django.contrib.auth.models import Permission


class LogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Log
        fields = "__all__"
        
    def get_admin_name(self, obj):
        if obj.admin:
            return {"id": obj.admin.id, "name": obj.admin.get_full_name()}
        return None
    
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields =['id', 'name']
    
    
class RoleSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(many=True, read_only = True)
    class Meta:
        model = Role
        fields = "__all__"
        
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):
                field = "lib_role" if field == "role_name" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Role",
                "id": instance.pk,
                "lib": instance.role_name,
                "changes": changes
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)

     
        
        
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
