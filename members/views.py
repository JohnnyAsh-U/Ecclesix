from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import MemberSerializer, SimpleMemberSerializer
from .models import Member
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q


@api_view(['GET'])
def MinisterWorkerMembers(request):
    params = request.query_params
    Ministre = params.get('Ministre', False)
    Ouvrier = params.get('Ouvrier', False)
    church = params.get('eglise', None)
    
    result = Member.objects
    
    if church:
        result = result.filter(church_id = church)
    
    if Ministre and not Ouvrier:
        result = result.filter(status = 'Ministre')
    elif Ouvrier and not Ministre:
        result = result.filter(status = 'Ouvrier')
    elif Ministre and Ouvrier:
        result = result.filter(Q(status = 'Ministre') | Q('Ouvrier'))
    
    # data = Member.objects.filter(status__in = [])
    
    serialized_data = SimpleMemberSerializer(result, many=True)
    return Response({"res": serialized_data.data})
    
    print(request.query_params)


class MemberListCreateView(ListCreateAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.all()
    

class MemberRUDView(RetrieveUpdateDestroyAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.prefetch_related('relations')
    
    