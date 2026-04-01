from rest_framework import serializers
from .models import Attendance
from admin_custom.models import Log


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    event_type_name = serializers.SerializerMethodField()
    church_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = '__all__'

    # def update(self, instance, validated_data):
    #     original_instance = type(instance).objects.get(pk=instance.pk)
    #     changes = {"old": {}, "new": {}}
    #     admin = self.context["request"].user.id

    #     field_map = {
    #         "member": "membre",
    #         "event_type": "type_evenement",
    #         "church": "eglise",
    #         "date": "date",
    #         "arrival_time": "heure_arrivee",
    #         "notes": "notes",
    #     }

    #     for field in validated_data:
    #         old_value = getattr(original_instance, field)
    #         new_value = validated_data[field]
    #         target_field = field_map.get(field, field)
    #         if old_value != new_value:
    #             changes["old"][target_field] = str(old_value)
    #             changes["new"][target_field] = str(new_value)

    #     if changes["new"] or changes["old"]:
    #         details = {
    #             "resource": "Presence",
    #             "id": instance.pk,
    #             "lib": str(instance),
    #             "changes": changes,
    #         }
    #         Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

    #     return super().update(instance, validated_data)

    def get_member_name(self, obj):
        return obj.member.get_full_name() if obj.member else None

    def get_event_type_name(self, obj):
        return obj.event_type.event_type_name if obj.event_type else None

    def get_church_name(self, obj):
        return obj.church.church_name if obj.church else None

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
