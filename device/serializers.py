from rest_framework import serializers

from .models import Device


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            "id",
            "identifier",
            "model_name",
            "brand_name",
            "device_name",
            "app_version",
            "is_registered",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "device_name",
            "is_registered",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        if not validated_data.get("device_name"):
            brand_name = validated_data.get("brand_name", "").strip()
            model_name = validated_data.get("model_name", "").strip()
            validated_data["device_name"] = (
                " ".join(part for part in [brand_name, model_name] if part)
                or validated_data["identifier"]
            )

        return super().create(validated_data)
