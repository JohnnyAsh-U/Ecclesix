from rest_framework import serializers
from .models import Member, Relationship
from church.models import City, Church_type, Church
from admin_custom.models import Role
from members.models import Member


class RelationshipSerializer(serializers.ModelSerializer):
    from_member = serializers.PrimaryKeyRelatedField(queryset= Member.objects.all(), write_only = True)
    to_member = serializers.PrimaryKeyRelatedField(queryset= Member.objects.all(), write_only = True)
    
    # from_member_info = serializers.SerializerMethodField()
    to_member_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Relationship
        fields = '__all__'


    def get_to_member_info(self, obj):
        if obj.to_member: return {
            "id": obj.to_member.id,
            "name": obj.to_member.get_full_name()
        }
        return None





class SimpleMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'is_active', 'gender', 
            'baptism_date', 'category', 'status', 'date_joined'
        ]





class MemberSerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset = City.objects.all(), write_only =True)
    church = serializers.PrimaryKeyRelatedField(queryset = Church.objects.all(), write_only =True)
    role = serializers.PrimaryKeyRelatedField(queryset = Role.objects.all(), write_only =True)
    followed_up_by = serializers.PrimaryKeyRelatedField(queryset = Member.objects.all(), write_only =True)
    
    city_name = serializers.SerializerMethodField()
    church_name = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()
    followed_up_by_name = serializers.SerializerMethodField()
    relations = serializers.SerializerMethodField()
    
    # members_followed_up = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_admin', 
            'gender', 'birthdate', 'date_joined', 'last_login', 'is_active',
            'phone', 'profession_type', 'profession', 'address',
            'baptism_date', 'marital_status', 'category', 'status',
            'city', 'city_name', 'church', 'church_name', 'role',
            'role_name', 'followed_up_by', 'followed_up_by_name',
            'relations', 'get_full_name', 'is_superuser'
        ]
        
    def get_city_name(self, obj):
        if obj.city:
            return f"{obj.city.city_name}"
        return None
    
    def get_church_name(self, obj):
        if obj.church: return f"{obj.church.church_name}"
        return None
    
    def get_role_name(self, obj):
        if obj.role : return f"{obj.role.role_name}"
        return None
    
    def get_followed_up_by_name(self, obj):
        if obj.followed_up_by: return {
            "id": obj.followed_up_by.id,
            "name": obj.followed_up_by.get_full_name()
        }
        return None
    
    def get_relations(self, obj):
        relations = Relationship.objects.filter(to_member = obj)
        if relations:
            return RelationshipSerializer(relations, many=True).data
        
    # def get_members_followed_up(self, obj):
    #     res = obj.members_followed_up.all()
    #     return FollowMemberSerializer(res, many =True).data
        
    
