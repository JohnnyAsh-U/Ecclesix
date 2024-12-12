from rest_framework import serializers
from .models import City, Church_type, Church
from members.models import Member
from admin_custom.models import Log


class SimpleChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = "__all__"


class ChurchSerializer(serializers.ModelSerializer):

    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset=Church_type.objects.all())
    leader = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all())
    leader2 = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(), allow_null=True
    )

    city_name = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField()
    leader_name = serializers.SerializerMethodField()
    leader2_name = serializers.SerializerMethodField()
    status_count = serializers.SerializerMethodField()
    total_members = serializers.SerializerMethodField()

    class Meta:
        model = Church
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):

                field = "ville" if field == "city" else field
                field = "ministre" if field == "leader" else field
                field = "assistant" if field == "leader2" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Eglise",
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

    def get_type_name(self, obj):
        if obj.type:
            return f"{obj.type.church_type_name}"
        return None

    def get_leader_name(self, obj):
        if obj.leader:
            return {"id": obj.leader.id, "name": obj.leader.get_full_name()}
        return None

    def get_leader2_name(self, obj):
        if obj.leader2:
            return {"id": obj.leader2.id, "name": obj.leader2.get_full_name()}
        return None

    def get_status_count(self, obj):
        return obj.get_member_count_by_status()

    def get_total_members(self, obj):
        return obj.total_members()


class CitySerializer(serializers.ModelSerializer):
    city_church = ChurchSerializer(many=True, read_only=True)

    class Meta:
        model = City
        fields = ["id", "city_name", "city_church"]

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "ville" if field == "city_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Ville",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        print(changes)
        return super().update(instance, validated_data)


class TypeSerializer(serializers.ModelSerializer):
    type_church = ChurchSerializer(many=True, read_only=True)

    class Meta:
        model = Church_type
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "type" if field == "church_type_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "TypeEglise",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        print(changes)
        return super().update(instance, validated_data)
