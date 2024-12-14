from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView
from .models import Department
from .models import Member
from church.models import Church
from .serializers import ChurchDepartmentSerializer
from rest_framework.response import Response


class DepartmentCreateListView(ListCreateAPIView):
    perms = {"GET": [], "OPTIONS": ["superadmin"]}
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

    
        #checks if he's only a departmental head, if so we return his only departments
        filter_permission2 = bool(
            not user.has_perm_custom("voir_touts_departements")
            and not user.has_perm_custom("voir_departement")
            and not user.is_superuser
            and user.has_perm_custom('chef_departement')
        )
        
        if filter_permission2:
            queryset = queryset.filter(departement_head = user)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

class DepartmentRUDView():
    pass
