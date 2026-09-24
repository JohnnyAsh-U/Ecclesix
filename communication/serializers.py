from rest_framework import serializers
from members.models import Member
from .models import TenantAnnouncement



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


