from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone

from .models import BillingPlan, ProviderInformation, Tenant
from .serializers import (
    BillingPlanSerializer,
    ProviderInformationSerializer,
    TenantBillingSerializer,
    TenantLogoSerializer,
    TenantPaymentHistorySerializer,
)



class TenantLookupMixin:
    def tenant_queryset(self):
        return Tenant.objects.select_related("plan").prefetch_related("payment_history__plan")

    def get_current_tenant(self, request):
        if not request.user.is_authenticated:
            return None, Response(status=status.HTTP_401_UNAUTHORIZED)

        if not request.user.is_superuser:
            return None, Response(
                {"detail": "Only superadmin users can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )

        schema_name = getattr(getattr(request, "tenant", None), "schema_name", None)
        if not schema_name or schema_name == "public":
            return None, Response(
                {"detail": "Tenant church context is required for this action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tenant = self.tenant_queryset().filter(schema_name=schema_name, is_active=True).first()
        if not tenant:
            return None, Response(
                {"detail": "No active tenant found for this church."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return tenant, None

    def get_tenant_by_id(self, tenant_id):
        tenant = self.tenant_queryset().filter(id=tenant_id, is_active=True).first()
        if not tenant:
            return None, Response(
                {"detail": "No active tenant found for this tenant_id."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return tenant, None


class BillingPlanListView(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
    }

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_superuser:
            return Response(
                {"detail": "Only superadmin users can access billing plans."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = BillingPlanSerializer(BillingPlan.objects.all(), many=True)
        return Response(serializer.data)


class TenantBillingView(TenantLookupMixin, APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
    }

    def get(self, request, *args, **kwargs):
        tenant, error = self.get_current_tenant(request)
        if error:
            return error
        
        provider_info_instance = ProviderInformation.objects.all().first()  # Assuming there's only one provider information record
        serializer = TenantBillingSerializer(tenant, context={"request": request})
        provider_info = ProviderInformationSerializer(provider_info_instance)

        # last 6 payment rows (most recent by paid_at)
        last_payments_qs = tenant.payment_history.filter(paid_at__isnull=False).order_by("-paid_at")[:6]
        
        serializer_payments = TenantPaymentHistorySerializer(last_payments_qs, many=True)

        return Response(
            {
                "tenant": serializer.data,
                "plan": serializer.data.get("plan"),
                "payment_history": serializer_payments.data,
                "provider_info": provider_info.data,
            }
        )


class TenantBrandingView(TenantLookupMixin, APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "PATCH": ["superadmin"],
    }
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        tenant, error = self.get_current_tenant(request)
        if error:
            return error

        serializer = TenantLogoSerializer(tenant, context={"request": request})
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        tenant, error = self.get_current_tenant(request)
        if error:
            return error

        logo = request.FILES.get("logo")
        if not logo:
            return Response(
                {"detail": "Please provide a logo file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tenant.logo = logo
        tenant.custom_logo = True
        tenant.save(update_fields=["logo", "custom_logo", "updated_at"])
        serializer = TenantLogoSerializer(tenant, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
