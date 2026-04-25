from rest_framework import serializers
from members.models import Member
from .models import TenantAnnouncement


class CommunicationMiniMemberSerializer(serializers.ModelSerializer):
    get_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ["id", "get_full_name", "phone", "email"]

    def get_get_full_name(self, obj):
        return obj.get_full_name()


class CommunicationSendSerializer(serializers.Serializer):
    channel = serializers.ChoiceField(choices=["email", "sms"])
    subject = serializers.CharField(required=False, allow_blank=True, max_length=255)
    message = serializers.CharField()
    member_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )

    def validate(self, attrs):
        channel = attrs.get("channel")
        subject = (attrs.get("subject") or "").strip()
        message = (attrs.get("message") or "").strip()

        if not message:
            raise serializers.ValidationError({"message": "Message is required"})

        if channel == "email" and not subject:
            raise serializers.ValidationError({"subject": "Subject is required for email"})

        attrs["subject"] = subject
        attrs["message"] = message
        return attrs


class TenantAnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    target_churches_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantAnnouncement
        fields = [
            'id', 'title', 'content', 'status', 'visibility', 
            'target_churches', 'target_churches_detail',
            'created_by', 'created_by_name', 'expiry_date', 
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'published_at']

    def get_target_churches_detail(self, obj):
        if obj.visibility == 'specific':
            return [{'id': c.id, 'name': c.name} for c in obj.target_churches.all()]
        return []

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
