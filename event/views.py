from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Event, Event_Type
from .serializers import EventSerializer
from members.models import Member
from datetime import date

class EventListCreateView(ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
    }
    def list(self, request, *args, **kwargs):
        today = date.today()
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 50))
        church = params.get("eglise", None)
        month = params.get("mois", today.month)
        year = params.get("annee", today.year)
        
        offset = (page - 1) * limit
        queryset = self.get_queryset().order_by("event_date")
        
        if year:
            queryset = queryset.filter(event_date__year=year)

        if month:
            queryset = queryset.filter(event_date__month=month)

        if not Membre:
            queryset = queryset.exclude(status="Membre")

        if not Visiteur:
            queryset = queryset.exclude(status="Visiteur")

        if not Visiteur:
            queryset = queryset.exclude(status="Visiteur")

        if not baptise:
            queryset = queryset.exclude(baptism_date__isnull=False)

    

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class EventView(RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_evenement", "voir_touts_evenements"],
        "POST": ["ajouter_evenement"],
        "PATCH": ["modifier_evenement"],
        "DELETE": ["supprimer_evenement"],
    }
    
    def retrieve(self, request, *args, **kwargs):
        user: Member = request.user
        params = self.request.query_params
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 50))
        church = params.get("eglise", None)
        month = params.get("mois", None)
        year = params.get("annee", None)
        
        offset = (page - 1) * limit
        queryset = self.get_queryset().order_by("event_date")
       
        serializer = self.get_serializer(queryset, many = True)
        return Response(serializer.data)

    # def list(self, request, *args, **kwargs):
    #     user: Member = request.user
    #     params = self.request.query_params
    #     page = int(params.get("page", 1))
    #     limit = int(params.get("limit", 50))
    #     search = params.get("search", None)
    #     age = params.get("age", None)
    #     gender = params.get("sexe", None)
    #     marital_status = params.get("statut_matrimonial", None)
    #     profession_type = params.get("type_metier", None)
    #     church = params.get("eglise", None)
    #     Ministre = True if params.get("Ministre", None) == "true" else False
    #     Ouvrier = True if params.get("Ouvrier", None) == "true" else False
    #     Membre = True if params.get("Membre", None) == "true" else False
    #     Visiteur = True if params.get("Visiteur", None) == "true" else False
    #     baptise = True if params.get("baptise", None) == "true" else False
    #     non_baptise = True if params.get("non_baptise", None) == "true" else False
    #     actif = True if params.get("actif", None) == "true" else False
    #     inactif = True if params.get("inactif", None) == "true" else False

    #     # we check for the perms if the api call is from the main page
    #     if (
    #         limit > 50
    #         and not user.has_perm_custom("voir_membre")
    #         and not user.has_perm_custom("voir_touts_membres")
    #         and not user.is_superuser
    #     ):
    #         return Response(status=status.HTTP_403_FORBIDDEN)

    #     offset = (page - 1) * limit
    #     queryset = self.get_queryset().order_by("first_name", "last_name")

    #     if search:
    #         # split into first and last name
    #         names = search.split()
    #         query = Q()
    #         for name in names:
    #             query &= Q(first_name__icontains=name) | Q(last_name__icontains=name)
    #         queryset = queryset.filter(query)

    #     if gender and gender != "tout":
    #         queryset = queryset.filter(gender="H" if gender == "H" else "F")

    #     if age and age != "tout":
    #         queryset = queryset.filter(
    #             birthdate__range=(time_date.age_range_to_year_range(age))
    #         )

    #     if marital_status and marital_status != "tout":
    #         queryset = queryset.filter(marital_status=marital_status)

    #     if profession_type and profession_type != "tout":
    #         queryset = queryset.filter(profession_type=profession_type)

    #     if church and church != "tout":
    #         queryset = queryset.filter(church_id=church)

    #     # we check if the api call is from the main member page,
    #     # if so and user is not a superadmin and does not have all members perms
    #     # we filter the members list by the admin church
    #     if (
    #         limit > 50
    #         and not user.is_superuser
    #         and not user.has_perm_custom("voir_touts_membres")
    #     ):
    #         queryset = queryset.filter(church_id=user.church.pk)

    #     if not Ministre:
    #         queryset = queryset.exclude(status="Ministre")

    #     if not Ouvrier:
    #         queryset = queryset.exclude(status="Ouvrier")

    #     if not Membre:
    #         queryset = queryset.exclude(status="Membre")

    #     if not Visiteur:
    #         queryset = queryset.exclude(status="Visiteur")

    #     if not Visiteur:
    #         queryset = queryset.exclude(status="Visiteur")

    #     if not baptise:
    #         queryset = queryset.exclude(baptism_date__isnull=False)

    #     if not non_baptise:
    #         queryset = queryset.exclude(baptism_date__isnull=True)

    #     if not actif:
    #         queryset = queryset.exclude(is_active=True)

    #     if not inactif:
    #         queryset = queryset.exclude(is_active=False)

    #     if limit > 50:
    #         ViewLogger(user.pk, {"resource": "Membre"})

    #     total_members = queryset.count()
    #     total_pages = math.ceil(total_members / limit)
    #     queryset = queryset[offset : offset + limit]
    #     # for api call that needs only names and few details
    #     if limit <= 50:
    #         serializer = SimpleMemberSerializer(queryset, many=True)
    #     else:
    #         serializer = self.get_serializer(queryset, many=True)
    #     return Response(
    #         {
    #             "list": serializer.data,
    #             "total_pages": total_pages,
    #             "total_members": total_members,
    #         }
    #     )

    # def create(self, request, *args, **kwargs):
    #     data = request.data
    #     data["birthdate"] = None if not data["birthdate"] else data["birthdate"]
    #     data["baptism_date"] = (
    #         None if not data["baptism_date"] else data["baptism_date"]
    #     )
    #     data.pop("followed_up_by") if not data.get("followed_up_by", None) else None
    #     serializer = self.get_serializer(data=data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     detail = {
    #         "resource": "Membre",
    #         "id": serializer.data["id"],
    #         "lib": serializer.data["get_full_name"],
    #     }
    #     Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(
    #         serializer.data, status=status.HTTP_201_CREATED, headers=headers
    #     )
