from django.shortcuts import render
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from members.models import Members
from authentication.auth import AuthBackend
from .auth import JWTAuthentication



class Connexion(APIView):
    authentication_classes = []

    def post(self, request, format=None):
        values = request.data.get("values", {})
        email = values.get("email", '')
        password = values.get("password", '')

        if not email or not password:
            return Response(
                {"status": False, "err": "Remplissez les champs"},
                status.HTTP_400_BAD_REQUEST,
            )

        admin = Members.objects.filter(email=email).exists()
        if not admin:
            return Response(
                {"status": False, "err": "Ce compte n'existe pas"},
                status.HTTP_400_BAD_REQUEST,
            )

        admin = AuthBackend.authenticate(request, email=email, password=password)
        if not admin:
            return Response(
                {"status": False, "err": "Password ou Username Incorrecte "},
                status.HTTP_400_BAD_REQUEST,
            )

        verified_email = admin.check_email_verification()

        if not verified_email:
            token, sent = admin.generate_email_verification()
            return Response(
                { "email": email, "token": token, "next": "VerifyEmail" }
            ) if sent else Response(
                { "err": 'Echec de verification' },
                status.HTTP_400_BAD_REQUEST
            )
            
            
        
        # print(request._request.COOKIES)
        return Response({"res": True})
