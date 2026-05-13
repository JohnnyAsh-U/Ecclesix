from rest_framework import serializers
from members.models import Member
from .models import TenantAnnouncement, Campaign, CampaignRecipient, ProviderConfig
from communication.factories import ChannelFactory, ProviderFactory
from communication.campaign_service import CampaignService


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
    
    
class OngoingAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantAnnouncement
        fields = ['id', 'title', 'content', 'published_at']
        


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
            return [{'id': c.id, 'church_name': c.church_name} for c in obj.target_churches.all()]
        return []

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ============================================================================
# Campaign Serializers
# ============================================================================


class CampaignCreateSerializer(serializers.Serializer):
    """
    Serializer for creating campaigns.
    Validates all required fields without allowing provider logic to leak.
    """
    channel = serializers.ChoiceField(choices=["email", "whatsapp"])
    provider = serializers.ChoiceField(choices=["resend", "smtp", "dialog360"])
    name = serializers.CharField(max_length=255)
    subject = serializers.CharField(required=False, allow_blank=True, max_length=255)
    body = serializers.CharField()
    member_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs):
        """Validate campaign data."""
        channel = attrs.get("channel")
        body = (attrs.get("body") or "").strip()
        subject = (attrs.get("subject") or "").strip()

        if not body:
            raise serializers.ValidationError({"body": "Message body is required"})

        if channel == "email" and not subject:
            raise serializers.ValidationError({"subject": "Subject is required for email campaigns"})

        attrs["body"] = body
        attrs["subject"] = subject if subject else None

        return attrs


class CampaignRecipientSerializer(serializers.ModelSerializer):
    """Serializer for campaign recipients."""
    member_name = serializers.CharField(source="member.get_full_name", read_only=True)

    class Meta:
        model = CampaignRecipient
        fields = [
            "id", "member", "member_name", "recipient_address",
            "status", "provider_message_id", "error_message",
            "sent_at", "delivered_at", "read_at"
        ]
        read_only_fields = ["id", "provider_message_id", "sent_at", "delivered_at", "read_at"]


class CampaignListSerializer(serializers.ModelSerializer):
    """Serializer for listing campaigns."""
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    success_rate = serializers.FloatField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id", "name", "channel", "provider", "status",
            "total_recipients", "sent_count", "delivered_count",
            "failed_count", "success_rate", "pending_count",
            "created_by", "created_by_name", "created_at", "scheduled_at"
        ]
        read_only_fields = [
            "id", "sent_count", "delivered_count", "failed_count",
            "created_by", "created_at"
        ]


class CampaignDetailSerializer(serializers.ModelSerializer):
    """Detailed campaign serializer with recipient breakdown."""
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    success_rate = serializers.FloatField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)
    recipients = CampaignRecipientSerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id", "name", "channel", "provider", "subject", "body", "status",
            "total_recipients", "sent_count", "delivered_count", "failed_count",
            "read_count", "success_rate", "pending_count",
            "created_by", "created_by_name", "created_at", "updated_at",
            "scheduled_at", "started_at", "completed_at",
            "error_message", "recipients"
        ]
        read_only_fields = [
            "id", "sent_count", "delivered_count", "failed_count", "read_count",
            "created_by", "created_at", "updated_at", "started_at", "completed_at",
            "recipients"
        ]


# ============================================================================
# Provider Configuration Serializers
# ============================================================================


class ProviderConfigCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating provider configuration."""
    channel = serializers.ChoiceField(choices=["email", "whatsapp"])
    provider = serializers.ChoiceField(choices=["resend", "smtp", "dialog360"])
    credentials = serializers.JSONField()

    def validate(self, attrs):
        """Validate and test credentials."""
        channel = attrs.get("channel")
        provider = attrs.get("provider")
        credentials = attrs.get("credentials")

        # Validate credentials exist
        if not credentials or not isinstance(credentials, dict):
            raise serializers.ValidationError({"credentials": "Valid credentials JSON required"})

        # Test provider connection
        success, error = CampaignService.test_provider(channel, provider, credentials)
        if not success:
            raise serializers.ValidationError({"credentials": f"Provider test failed: {error}"})

        return attrs


class ProviderConfigSerializer(serializers.ModelSerializer):
    """Serializer for listing provider configurations (WITHOUT credentials)."""
    
    class Meta:
        model = ProviderConfig
        fields = [
            "id", "channel", "provider", "is_active", "is_verified",
            "created_at", "updated_at", "last_tested_at", "test_error"
        ]
        read_only_fields = [
            "id", "is_verified", "created_at", "updated_at", "last_tested_at"
        ]

    def to_representation(self, instance):
        """Never expose encrypted credentials in API response."""
        data = super().to_representation(instance)
        # Ensure credentials are never included
        data.pop("_encrypted_credentials", None)
        return data
