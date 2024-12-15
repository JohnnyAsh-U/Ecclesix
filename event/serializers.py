from rest_framework import serializers
from .models import Event, Event_Type
from admin_custom.models import Log

class EventSerializer(serializers.ModelSerializer):
    event_type = serializers.StringRelatedField()
    church = serializers.StringRelatedField()
    class Meta:
        model = Event
        fields = '__all__'
        
        
class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event_Type
        fields = '__all__'
        
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):

                field = "culte_ordinaire" if field == "weekly_event" else field
                field = "lib" if field == "event_type_name" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Type Evenement",
                "id": instance.pk,
                "lib": instance.event_type_name,
                "changes": changes,
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)
