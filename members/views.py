from rest_framework.response import Response
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView,
    UpdateAPIView,
    GenericAPIView,
)
from members.models import Relationship
from rest_framework.mixins import DestroyModelMixin, CreateModelMixin
from .serializers import (
    MemberSerializer,
    SimpleMemberSerializer,
    RelationshipSerializer,
)
from .models import Member
from django.db.models import Q
from rest_framework import status
from backend.utils import time_date
from admin_custom.services import ViewLogger
from admin_custom.models import Log
import math


class MinisterWorkerMembers(ListAPIView):
    serializer_class = SimpleMemberSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
    }

    def get_queryset(self):
        params = self.request.query_params
        Ministre = params.get("Ministre", False)
        Ouvrier = params.get("Ouvrier", False)
        church = params.get("eglise", None)
        result = Member.objects

        if church and church != "null":
            result = result.filter(church_id=church)
        if Ministre and not Ouvrier:
            result = result.filter(status="Ministre")
        elif Ouvrier and not Ministre:
            result = result.filter(status="Ouvrier")
        elif Ministre and Ouvrier:
            result = result.filter(Q(status="Ministre") | Q(status="Ouvrier"))
        else:
            result = []
        return result


class MemberListCreateView(ListCreateAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.all()
    perms = {"OPTIONS": ["superadmin"], "GET": [], "POST": ["ajouter_membre"]}

    def list(self, request, *args, **kwargs):
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 50))
        search = params.get("search", None)
        age = params.get("age", None)
        gender = params.get("sexe", None)
        marital_status = params.get("statut_matrimonial", None)
        profession_type = params.get("type_metier", None)
        church = params.get("eglise", None)
        Ministre = True if params.get("Ministre", None) == "true" else False
        Ouvrier = True if params.get("Ouvrier", None) == "true" else False
        Membre = True if params.get("Membre", None) == "true" else False
        Visiteur = True if params.get("Visiteur", None) == "true" else False
        baptise = True if params.get("baptise", None) == "true" else False
        non_baptise = True if params.get("non_baptise", None) == "true" else False
        actif = True if params.get("actif", None) == "true" else False
        inactif = True if params.get("inactif", None) == "true" else False

        # we check for the perms if the api call is from the main page
        if (
            limit > 50
            and not user.has_perm_custom("voir_membre")
            and not user.has_perm_custom("voir_touts_membres")
            and not user.is_superuser
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        offset = (page - 1) * limit
        queryset = self.get_queryset().order_by("first_name", "last_name")

        if search:
            # split into first and last name
            names = search.split()
            query = Q()
            for name in names:
                query &= Q(first_name__istartswith=name) | Q(last_name__istartswith=name)
            queryset = queryset.filter(query)

        if gender and gender != "tout":
            queryset = queryset.filter(gender="H" if gender == "H" else "F")

        if age and age != "tout":
            queryset = queryset.filter(
                birthdate__range=(time_date.age_range_to_year_range(age))
            )

        if marital_status and marital_status != "tout":
            queryset = queryset.filter(marital_status=marital_status)

        if profession_type and profession_type != "tout":
            queryset = queryset.filter(profession_type=profession_type)

        if church and church != "tout":
            queryset = queryset.filter(church_id=church)

        # we check if the api call is from the main member page,
        # if so and user is not a superadmin and does not have all members perms
        # we filter the members list by the admin church
        if (
            limit > 50
            and not user.is_superuser
            and not user.has_perm_custom("voir_touts_membres")
        ):
            queryset = queryset.filter(church_id=user.church.pk)

        if not Ministre:
            queryset = queryset.exclude(status="Ministre")

        if not Ouvrier:
            queryset = queryset.exclude(status="Ouvrier")

        if not Membre:
            queryset = queryset.exclude(status="Membre")

        if not Visiteur:
            queryset = queryset.exclude(status="Visiteur")

        if not Visiteur:
            queryset = queryset.exclude(status="Visiteur")

        if not baptise:
            queryset = queryset.exclude(baptism_date__isnull=False)

        if not non_baptise:
            queryset = queryset.exclude(baptism_date__isnull=True)

        if not actif:
            queryset = queryset.exclude(is_active=True)

        if not inactif:
            queryset = queryset.exclude(is_active=False)

        if limit > 50:
            ViewLogger(user.pk, {"resource": "Membre"})

        total_members = queryset.count()
        total_pages = math.ceil(total_members / limit)
        queryset = queryset[offset : offset + limit]
        # for api call that needs only names and few details
        if limit <= 50:
            serializer = SimpleMemberSerializer(queryset, many=True)
        else:
            serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "list": serializer.data,
                "total_pages": total_pages,
                "total_members": total_members,
            }
        )

    def create(self, request, *args, **kwargs):
        data = request.data
        data["birthdate"] = None if not data["birthdate"] else data["birthdate"]
        data["email"] = None if not data["email"] else data["email"]
        data["baptism_date"] = (
            None if not data["baptism_date"] else data["baptism_date"]
        )
        data.pop("followed_up_by") if not data.get("followed_up_by", None) else None
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": "Membre",
            "id": serializer.data["id"],
            "lib": serializer.data["get_full_name"],
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class MemberRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": [],
        "PATCH": ["modifier_membre"],
        "PUT": ["modifier_membre"],
        "DELETE": ["superadmin"],
    }
    serializer_class = MemberSerializer
    queryset = Member.objects.prefetch_related("relations")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        # to get the follow up members
        follow_up = instance.members_followed_up.all()
        serialized_follow_up = SimpleMemberSerializer(follow_up, many=True)

        serialized_result = dict(serializer.data)
        serialized_result["follow_up"] = serialized_follow_up.data

        # logging details
        detail = {
            "resource": "Profile",
            "id": serializer.data["id"],
            "lib": serializer.data["get_full_name"],
        }
        ViewLogger(request.user.id, detail)
        return Response(data=serialized_result)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # check if the admin has perm to edit
        self.check_edit_profile_perms(request, instance)
        data = request.data
        serializer = self.get_serializer(
            instance, data=data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response()

    # this method is for toggling the active field on members
    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        self.check_edit_profile_perms(request, obj)
        obj.is_active = not obj.is_active
        obj.is_superuser = False
        obj.save()
        detail = {
            "resource": (
                "Membre-Activation" if obj.is_active else "Membre-Desactivation"
            ),
            "id": obj.pk,
            "lib": obj.get_full_name(),
        }
        Log.objects.create(admin_id=request.user.id, log_type="UPDATE", detail=detail)

        return Response()

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_delete_profile_perms(request, instance)
        detail = {
            "resource": "Membre",
            "id": instance.pk,
            "lib": instance.get_full_name(),
        }
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def check_object_permissions(self, request, obj):
        """
        Check if the admin should be permitted to view profile object.
        """
        user: Member = request.user
        if user.is_superuser or user.has_perm_custom("voir_touts_membres"):
            return
        if user.has_perm_custom("voir_membre") and obj.church_id == user.church_id:
            return
        if user.pk == obj.pk:
            return

        self.permission_denied(
            request,
            message="Denied",
            code="401",
        )

    def check_edit_profile_perms(self, request, obj):
        user: Member = request.user

        # First Super admin can edit and delete any account
        if user.is_superuser and user.id == 1:
            return

        # Superadmin can edit their profile
        if user.is_superuser and user.id == obj.id:
            return

        # superadmin cannot edit other superadmin user
        if user.is_superuser and not obj.is_superuser:
            return

        # admin can edit ordinary member accounts of their church
        if user.is_admin and not obj.is_admin and user.church_id == obj.church_id:
            return

        self.permission_denied(
            request,
            message="Denied",
            code="401",
        )

    def check_delete_profile_perms(self, request, obj):
        user: Member = request.user

        # First Super admin can delete any account except his account
        if user.is_superuser and user.id != obj.id and user.id == 1:
            return

        # Superadmin can delete other nonsuperuser profile
        if user.is_superuser and not obj.is_superuser:
            return
        self.permission_denied(
            request,
            message="Denied",
            code="401",
        )


class MemberRoleUpdateView(UpdateAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["modifier_membre"],
    }

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response()

    def check_object_permissions(self, request, obj):
        """
        Check if the admin should be permitted to view profile object.
        """
        user: Member = request.user
        if user.is_superuser or user.has_perm_custom("voir_touts_membres"):
            return
        if user.has_perm_custom("voir_membre") and obj.church_id == user.church_id:
            return
        if user.pk == obj.pk:
            return

        self.permission_denied(
            request,
            message="Denied",
            code="401",
        )


class RelationshipUpdateDeleteView(CreateModelMixin, DestroyModelMixin, GenericAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["modifier_membre"],
        "DELETE": ["superadmin"],
    }
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        id = kwargs["pk"]
        instance = Relationship.objects.filter(id=id).first()
        reverse_instance = Relationship.objects.filter(
            from_member_id=instance.to_member_id,
            to_member_id=instance.from_member_id,
        )
        self.logger(request, RelationshipSerializer(instance).data, "DELETE")
        self.perform_destroy(instance)
        self.perform_destroy(reverse_instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        to_member = kwargs["pk"]
        from_member = request.data.get("from_member", None)
        relationship = request.data.get("relationship", None)
        data = {
            "to_member": to_member,
            "from_member": from_member,
            "relationship": relationship,
        }
        reverse = relationship

        # reverse relationship
        if relationship == "Parent":
            reverse = "Enfant"
        elif relationship == "Enfant":
            reverse = "Parent"
        else:
            reverse = relationship

        reverse_data = {
            "to_member": from_member,
            "from_member": to_member,
            "relationship": reverse,
        }

        serializer = self.get_serializer(data=data)
        serializer_reverse = self.get_serializer(data=reverse_data)

        serializer.is_valid(raise_exception=True)
        serializer_reverse.is_valid(raise_exception=True)

        self.perform_create(serializer)
        self.perform_create(serializer_reverse)

        self.logger(request, serializer.data, "INSERT")
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_201_CREATED)

    def logger(self, request, instance, action):
        changes = {
            "membre": instance["to_member_info"]["name"],
            "relation": instance["from_member_info"]["name"],
            "type": instance["relationship"],
        }
        detail = {
            "resource": "Membre-Relation",
            "id": instance["id"],
            "lib": instance["to_member_info"]["name"],
            "changes": changes,
            "action" : action
        }
        Log.objects.create(log_type="UPDATE", detail=detail, admin=request.user)
