from rest_framework import serializers
from .models import Member, Relationship
from church.models import City, Church_type, Church
from admin_custom.models import Role, Log
from members.models import Member


class RelationshipSerializer(serializers.ModelSerializer):
    from_member = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), write_only=True
    )
    to_member = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), write_only=True
    )

    # from_member_info = serializers.SerializerMethodField()
    from_member_info = serializers.SerializerMethodField()
    to_member_info = serializers.SerializerMethodField()

    class Meta:
        model = Relationship
        fields = "__all__"

    def get_from_member_info(self, obj):
        if obj.from_member:
            return {"id": obj.from_member.id, "name": obj.from_member.get_full_name()}
        return None
    
    def get_to_member_info(self, obj):
        if obj.to_member:
            return {"id": obj.to_member.id, "name": obj.to_member.get_full_name()}
        return None


class SimpleMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "first_name",
            "last_name",
            "is_active",
            "gender",
            "baptism_date",
            "category",
            "status",
            "date_joined",
            "get_full_name",
            "marital_status",
            "profession_type",
            "phone",
            "birthdate"
        ]


class MemberSerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    church = serializers.PrimaryKeyRelatedField(queryset=Church.objects.all())
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), required=False
    )
    followed_up_by = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), write_only=True, required=False
    )

    city_name = serializers.SerializerMethodField()
    church_name = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()
    followed_up_by_name = serializers.SerializerMethodField()
    relations = serializers.SerializerMethodField()
    departments = serializers.SerializerMethodField()


    class Meta:
        model = Member
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_admin",
            "gender",
            "birthdate",
            "date_joined",
            "last_login",
            "is_active",
            "phone",
            "profession_type",
            "profession",
            "address",
            "baptism_date",
            "marital_status",
            "category",
            "status",
            "city",
            "city_name",
            "church",
            "church_name",
            "role",
            "role_name",
            "followed_up_by",
            "followed_up_by_name",
            "relations",
            "departments",
            "get_full_name",
            "is_superuser",
        ]

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):

                field = "eglise" if field == "church" else field
                field = "ville" if field == "city" else field
                field = "suivi_par" if field == "followed_up_by" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Membre",
                "id": instance.pk,
                "lib": str(instance),
                "changes": changes,
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)

    def get_city_name(self, obj):
        if obj.city:
            return f"{obj.city.city_name}"
        return None

    def get_church_name(self, obj):
        if obj.church:
            return f"{obj.church.church_name}"
        return None

    def get_role_name(self, obj):
        if obj.role:
            return f"{obj.role.role_name}"
        return None

    def get_followed_up_by_name(self, obj):
        if obj.followed_up_by:
            return {
                "id": obj.followed_up_by.id,
                "name": obj.followed_up_by.get_full_name(),
            }
        return None

    def get_relations(self, obj):
        relations = Relationship.objects.filter(to_member=obj)
        if relations:
            return RelationshipSerializer(relations, many=True).data
        
    def get_departments(self, obj):
        deps = obj.departments.all()
        if deps:
            res = []
            for dep in deps:
                res.append({
                    "id": dep.id,
                    "name": dep.department_name,
                    "head": dep.department_head_id
                })
            return res
