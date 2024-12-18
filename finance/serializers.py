from .models import Category, Transaction_Rule, Account
from rest_framework import serializers
from admin_custom.models import Log
from rest_framework.exceptions import ValidationError
from django.db.models import Sum


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_categorie" if field == "category_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Categorie",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)




class RuleSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()
    class Meta:
        model = Transaction_Rule
        fields = "__all__"
        

    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_regle" if field == "rule_name" else field
            field = "pourcentage" if field == "percentage" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Regle",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)
    
    def get_church_name(self, obj):
        return obj.church.church_name
    
    def get_category_name(self, obj):
        return obj.category.category_name
    
    def get_account_name(self, obj):
        return obj.account.account_name
    
    
class AccountSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()
   
    class Meta:
        model = Account
        fields = '__all__'
        
    def update(self, instance, validated_data):
        original_instance = type(instance).objects.get(pk=instance.pk)
        changes = {"old": {}, "new": {}}
        admin = self.context["request"].user.id
        for field in validated_data:
            old_value = getattr(original_instance, field)
            new_value = validated_data[field]
            field = "lib_compte" if field == "account_name" else field
            if old_value != new_value:
                changes["old"][field] = str(old_value)
                changes["new"][field] = str(new_value)
        details = {
            "resource": "Compte",
            "id": instance.pk,
            "lib": str(instance),
            "changes": changes,
        }
        Log.objects.create(log_type="UPDATE", admin_id=admin, detail=details)
        return super().update(instance, validated_data)
    
    def get_church_name(self, obj):
        return obj.church.church_name

