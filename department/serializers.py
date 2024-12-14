from rest_framework.serializers import (
    ModelSerializer,
    StringRelatedField,
    SerializerMethodField,
)
from church.models import Church
from admin_custom.models import Log
from .models import Department
from members.serializers import SimpleMemberSerializer


class DepartmentSerializer(ModelSerializer):
    # department_head = StringRelatedField()
    member = SimpleMemberSerializer(many=True, read_only = True)

    class Meta:
        model = Department
        fields = "__all__"
        
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]

            if hasattr(instance._meta.get_field(field), "related_model"):

                field = "chef" if field == "department_head" else field
                field = "lib_departement" if field == "department_name" else field
                if old_value != new_value:
                    changes["old"][field] = str(old_value)
                    changes["new"][field] = str(new_value)

        if len(changes["new"]) > 0 or len(changes["old"]) > 0:
            details = {
                "resource": "Departement",
                "id": instance.pk,
                "lib": str(instance) + ' ' + str(instance.church),
                "changes": changes,
            }
            Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)

        return super().update(instance, validated_data)



class ChurchDepartmentSerializer(ModelSerializer):
    departments_list = SerializerMethodField()

    class Meta:
        model = Church
        fields = ["id", "church_name", "departments_list"]

    def get_departments_list(self, obj):
        list_deps = obj.departments.all()
        if list_deps:
            res = []
            for dep in list_deps:
                res.append(
                    {
                        "id": dep.id,
                        "department_name": dep.department_name,
                        "member": dep.member.all().count(),
                    }
                )
            return res
        return None
