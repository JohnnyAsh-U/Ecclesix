from rest_framework.serializers import ModelSerializer, StringRelatedField, SerializerMethodField
from church.models import Church
from .models import Department


class DepartmentSerializer(ModelSerializer):
    department_head = StringRelatedField()

    class Meta:
        model = Department
        fields = "__all__"


class ChurchDepartmentSerializer(ModelSerializer):
    departments_list = SerializerMethodField()

    class Meta:
        model = Church
        fields = ["id", "church_name", "departments_list"]

    def get_departments_list(self, obj):
        if obj.departments.all():
            return DepartmentSerializer(obj.departments.all(), many=True).data
        return None
