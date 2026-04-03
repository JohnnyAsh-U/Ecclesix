from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListCreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_custom.models import Log
from .models import Device
from .serializers import DeviceSerializer


class DeviceListCreateView(ListCreateAPIView):
    queryset = Device.objects.all().order_by("-created_at")
    serializer_class = DeviceSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        detail = {
            "resource": "Device",
            "id": serializer.data["id"],
            "lib": serializer.data["identifier"],
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DeviceRegisterDeleteView(UpdateAPIView, DestroyAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        previous_state = instance.is_registered
        instance.is_registered = True
        instance.save(update_fields=["is_registered", "updated_at"])

        detail = {
            "resource": "Device",
            "id": instance.pk,
            "lib": instance.identifier,
            "changes": {
                "old": {"is_registered": previous_state},
                "new": {"is_registered": instance.is_registered},
            },
        }
        Log.objects.create(admin_id=request.user.id, log_type="UPDATE", detail=detail)

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Device",
            "id": instance.pk,
            "lib": instance.identifier,
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeviceCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, identifier, *args, **kwargs):
        try:
            device = Device.objects.only("identifier", "is_registered").get(identifier=identifier)
        except Device.DoesNotExist as exc:
            raise NotFound("Device not found.") from exc

        return Response(
            {
                "identifier": device.identifier,
                "is_registered": device.is_registered,
            },
            status=status.HTTP_200_OK,
        )
