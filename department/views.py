from django.shortcuts import render
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    DestroyAPIView,
    CreateAPIView,
)
from .models import Department
from .models import Member
from church.models import Church
from .serializers import ChurchDepartmentSerializer, DepartmentSerializer
from rest_framework.response import Response
from rest_framework import status
from admin_custom.models import Log
from admin_custom.services import ViewLogger


class DepartmentCreateListView(ListCreateAPIView):
    perms = {"GET": [], "OPTIONS": ["superadmin"], "POST": ["ajouter_departement"]}
    queryset = (
        Church.objects.prefetch_related("departments")
        .filter(church_department__isnull=False)
        .distinct()
    )
    serializer_class = ChurchDepartmentSerializer

    def list(self, request, *args, **kwargs):
        user: Member = request.user
        queryset = self.get_queryset()
        # check if the user has perms to see deps from all churches
        filter_permission = bool(
            not user.has_perm_custom("voir_touts_departements")
            and not user.is_superuser
        )
        if filter_permission:
            queryset = queryset.filter(id=user.church_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        if data["church"] != user.church_id and not user.is_superuser:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # we add the department head to the department
        dep = Department.objects.get(id=serializer.data["id"])
        dep_head = Member.objects.get(id=serializer.data["department_head"])
        dep.member.add(dep_head)
        dep.save()

        # logging the department creation
        detail = {
            "resource": "Departement",
            "id": serializer.data["department_name"],
            "lib": f"{serializer.data['department_name']} ({str(dep.church)})",
        }
        Log.objects.create(admin=user, log_type="INSERT", detail=detail)

        # logging the adding of department head
        detail = {
            "resource": "Departement-Membre",
            "id": dep_head.pk,
            "lib": dep_head.get_full_name(),
            "dep": f"{dep.department_name} ({str(dep.church)})",
        }
        Log.objects.create(admin=user, log_type="INSERT", detail=detail)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class DepartmentRUDView(RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    perms = {
        "GET": ["voir_departement", "voir_touts_departements", "chef_departement"],
        "PATCH": ["modifier_departement"],
        "DELETE": ["supprimer_departement"],
        "OPTIONS": ["superadmin"],
    }

    def get(self, request, *args, **kwargs):
        ViewLogger(request.user.id, {"resource": "Departement"})
        return super().get(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        user = request.user
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        dep_head = serializer.data["department_head"]

        # check if the new head is a member of the department if not we add him
        is_among_member = False
        for mem in instance.member.all():
            if mem.id == dep_head:
                is_among_member = True
                break

        if not is_among_member:
            dep_head_instance = Member.objects.get(id=dep_head)
            instance.member.add(dep_head_instance)
            instance.save()
            # logging the adding of department head
            detail = {
                "resource": "Departement-Membre",
                "id": dep_head_instance.pk,
                "lib": dep_head_instance.get_full_name(),
                "dep": f"{instance.department_name} ({str(instance.church)})",
            }
            Log.objects.create(admin=user, log_type="INSERT", detail=detail)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if (
            instance.church_id != request.user.church_id
            and not request.user.is_superuser
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)
        detail = {
            "resource": "Departement",
            "id": instance.pk,
            "lib": f"{instance.department_name} ({str(instance.church)})",
        }
        Log.objects.create(admin=request.user, log_type="DELETE", detail=detail)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddDepartmentMembers(CreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["modifier_departement", "chef_departement"],
    }

    def create(self, request, *args, **kwargs):
        id = kwargs["pk"]
        dep = Department.objects.get(id=id)
        member = Member.objects.get(id=request.data["member"])
        dep.member.add(member)
        dep.save()
        # logging the adding of department head
        detail = {
            "resource": "Departement-Membre",
            "id": member.pk,
            "lib": member.get_full_name(),
            "dep": f"{dep.department_name} ({str(dep.church)})",
        }
        Log.objects.create(admin=request.user, log_type="INSERT", detail=detail)

        return Response(status=status.HTTP_201_CREATED)


class RemoveDepartmentMembers(DestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "DELETE": ["modifier_departement", "chef_departement"],
    }

    def destroy(self, request, *args, **kwargs):
        id = kwargs["pk"]
        m_id = kwargs["mpk"]
        dep = Department.objects.get(id=id)
        member = Member.objects.get(id=m_id)
        dep.member.remove(member)
        dep.save()
        # logging the removeing of department head
        detail = {
            "resource": "Departement-Membre",
            "id": member.pk,
            "lib": member.get_full_name(),
            "dep": f"{dep.department_name} ({str(dep.church)})",
        }
        Log.objects.create(admin=request.user, log_type="DELETE", detail=detail)

        return Response(status=status.HTTP_204_NO_CONTENT)
