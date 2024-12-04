from rest_framework import serializers
from .models import City, Church_type, Church
from members.models import Member


class SimpleChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = '__all__'



class ChurchSerializer(serializers.ModelSerializer):
    
    city = serializers.PrimaryKeyRelatedField(queryset = City.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset = Church_type.objects.all())
    leader = serializers.PrimaryKeyRelatedField(queryset = Member.objects.all())
    leader2 = serializers.PrimaryKeyRelatedField(queryset = Member.objects.all(), allow_null = True)
    
    city_name = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField()
    leader_name = serializers.SerializerMethodField()
    leader2_name = serializers.SerializerMethodField()
    status_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Church
        fields = '__all__'
        
        
    def get_city_name(self, obj):
        if obj.city: return f"{obj.city.city_name}"
        return None
    
    def get_type_name(self, obj):
        if obj.type: return f"{obj.type.church_type_name}"
        return None
    
    def get_leader_name(self, obj):
        if obj.leader: return {
            "id": obj.leader.id,
            "name": obj.leader.get_full_name()
        }
        return None
    
    def get_leader2_name(self, obj):
        if obj.leader2: return {
            "id": obj.leader2.id,
            "name": obj.leader2.get_full_name()
        }
        return None
    
    def get_status_count(self, obj):
        return obj.get_member_count_by_status()
        





class CitySerializer(serializers.ModelSerializer):
    city_church = ChurchSerializer(many =True, read_only=True)
    class Meta:
        model = City
        fields = ['id', 'city_name', 'city_church']
        




class TypeSerializer(serializers.ModelSerializer):
    type_church = ChurchSerializer(many =True, read_only=True)
    
    class Meta:
        model = Church_type
        fields = '__all__'
        
