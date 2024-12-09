from django.shortcuts import render
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
    

class MemberRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.prefetch_related('relations')
    
    