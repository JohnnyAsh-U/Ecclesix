from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import CategorySerializer, RuleSerializer, AccountSerializer
from .models import Category, Transaction_Rule, Account
from admin_custom.models import Log
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status
from django.db.models import Sum
from church.models import Church
from church.serializers import SimpleChurchSerializer
from decimal import Decimal


class CategoryListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": "Categorie",
            "id": serializer.data["id"],
            "lib": serializer.data["category_name"],
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CategoryRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {"resource": "Categorie", "id": instance.pk, "lib": str(instance)}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionRuleListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }
    serializer_class = RuleSerializer
    queryset = Transaction_Rule.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        church = SimpleChurchSerializer(Church.objects.all(), many=True)
        category = CategorySerializer(
            Category.objects.filter(category_type="Credit"), many=True
        )
        account = AccountSerializer(
            Account.objects.filter(account_type="Caisse"), many=True
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "rules": serializer.data,
                "church": church.data,
                "category": category.data,
                "account": account.data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.check_percentage(request.data)
        self.perform_create(serializer)
        detail = {
            "resource": "Regle",
            "id": serializer.data["id"],
            "lib": f"{serializer.data['rule_name']} ({serializer.data['church_name']})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def check_percentage(self, data):
        percentage_sum = Transaction_Rule.objects.filter(
            church_id=data["church"], category_id=data["category"]
        ).aggregate(percent_sum=Sum("percentage"))
        if percentage_sum["percent_sum"]:
            if (percentage_sum["percent_sum"] + Decimal(data["percentage"])) > 100.00:
                raise ValidationError("Not Valid")


class TransactionRuleRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = RuleSerializer
    queryset = Transaction_Rule.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.check_percentage(instance, percent=request.data["percentage"])
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Regle",
            "id": instance.pk,
            "lib": f"{instance.rule_name} ({instance.church.church_name})",
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def check_percentage(self, data, percent):
        percentage_sum = (
            Transaction_Rule.objects.filter(church=data.church, category=data.category)
            .exclude(id=data.pk)
            .aggregate(percent_sum=Sum("percentage"))
        )
        if percentage_sum["percent_sum"]:
            if (percentage_sum["percent_sum"] + Decimal(percent)) > 100.00:
                raise ValidationError("Not Valid")



