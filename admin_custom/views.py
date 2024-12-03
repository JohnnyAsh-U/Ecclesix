from django.shortcuts import render
from rest_framework.views import APIView, View
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from church.models import Church
from church.serializers import ChurchSerializer
# from rest_framework.serializers import 

# Create your views here.

class AdminPermissions(APIView):
    authentication_classes = [SessionAuthentication]
    
    def get(self, request, format = None):
        serialized_church = ChurchSerializer(Church.objects.all(), many=True)
        return Response({"permissions": {"superAdmin": True }, "eglises": serialized_church.data})
