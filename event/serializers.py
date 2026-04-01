from rest_framework import serializers
from .models import Event, Event_Type
from admin_custom.models import Log
from church.models import Church

class EventSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()
    event_type_name = serializers.SerializerMethodField()
    event_type_start_time = serializers.SerializerMethodField()
    event_type_end_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'
        
        
           
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):

                field = "eglise" if field == "church" else field
                field = "type" if field == "event_type" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Evenement",
                "id": instance.pk,
                "lib": f"{instance.event_type} ({instance.church.church_name})",
                "changes": changes,
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)

        
    def get_event_type_name(self, obj):
        if obj.event_type:
            return f"{obj.event_type.event_type_name}"
        return None

    def get_event_type_start_time(self, obj):
        if obj.event_type and obj.event_type.start_time:
            return obj.event_type.start_time.strftime("%H:%M:%S")
        return None

    def get_event_type_end_time(self, obj):
        if obj.event_type and obj.event_type.end_time:
            return obj.event_type.end_time.strftime("%H:%M:%S")
        return None
    
    def get_church_name(self, obj):
        if obj.church:
            return f"{obj.church.church_name}"
        return None
        
        
class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event_Type
        fields = '__all__'
        
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id

        field_map = {
            "weekly_event": "culte_ordinaire",
            "event_type_name": "lib",
            "start_time": "heure_debut",
            "end_time": "heure_fin",
        }

        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            target_field = field_map.get(field, field)

            if old_value != new_value:
                changes["old"][target_field] = str(old_value)
                changes["new"][target_field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Type Evenement",
                "id": instance.pk,
                "lib": instance.event_type_name,
                "changes": changes,
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)
