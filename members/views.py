from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from .serializers import MemberSerializer, SimpleMemberSerializer
from .models import Member
from django.db.models import Q


class MinisterWorkerMembers(ListAPIView):
    serializer_class = SimpleMemberSerializer
    perms = {
        "OPTIONS": ['superadmin'],
        "GET": [],
    }
    
    def get_queryset(self):
        params = self.request.query_params
        Ministre = params.get('Ministre', False)
        Ouvrier = params.get('Ouvrier', False)
        church = params.get('eglise', None)
        result = Member.objects
        
        if church:
            result = result.filter(church_id = church)
        
        if Ministre and not Ouvrier:
            result = result.filter(status = 'Ministre')
            print(result)
        elif Ouvrier and not Ministre:
            result = result.filter(status = 'Ouvrier')
        elif Ministre and Ouvrier:
            result = result.filter(Q(status = 'Ministre') | Q('Ouvrier'))
        else:
            result = []
        return result
    



class MemberListCreateView(ListCreateAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.all()
    perms = {
        "OPTIONS": ['superadmin'],
        "GET": [],
        "POST": ['ajouter_membre']
    }
    
    def list(self, request, *args, **kwargs):
        # params = self.request.query_params
        # page = params.get('page', None)
        # limit = params.get('limit', None)
        # search = params.get('search', None)
        # age = params.get('age', None)
        # sexe = params.get('sexe', None)
        # statut_matrimonial = params.get('statut_matrimonial', None)
        # type_metier = params.get('type_metier', None)
        # eglise = params.get('eglise', None)
        # Ministre = params.get('Ministre', None)
        # Ouvrier = params.get('Ouvrier', None)
        # Membre = params.get('Membre', None)
        # Membre = params.get('Membre', None)
        # Visiteur = params.get('Visiteur', None)
        # baptise = params.get('baptise', None)
        # non_baptise = params.get('non_baptise', None)
        # actif = params.get('actif', None)
        # inactif = params.get('inactif', None)
        # result = Member.objects
        
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    
    

class MemberRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.prefetch_related('relations')
    
    