from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .permission import IsInternalAdminOrMod
from tenants.models import BillingPlan


class BillingPlanListCreateView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    """GET: List all billing plans; POST: Create a new billing plan"""
    def get(self, request):
        """Returns list of all billing plans"""
        plans = BillingPlan.objects.all().order_by('price')
        data = [
            {
                'id': plan.id,
                'code': plan.code,
                'name': plan.name,
                'price': str(plan.price),
                'currency': plan.currency,
                'max_churches': plan.max_churches,
                'max_members': plan.max_members,
                'created_at': plan.created_at,
                'updated_at': plan.updated_at,
            }
            for plan in plans
        ]
        return Response(data)

    def post(self, request):
        """Create a new billing plan"""
        code = request.data.get('code', '').strip().lower()
        name = request.data.get('name', '').strip()
        price = request.data.get('price', 0)
        currency = request.data.get('currency', 'FCFA').strip()
        max_churches = request.data.get('max_churches', 1)
        max_members = request.data.get('max_members', 100)

        # Validate required fields
        if not code or not name:
            return Response(
                {'detail': 'Les champs code et name sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if code already exists
        if BillingPlan.objects.filter(code=code).exists():
            return Response(
                {'detail': f'Un plan avec le code "{code}" existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            price = float(price)
            max_churches = int(max_churches)
            max_members = int(max_members)
        except ValueError as e:
            return Response(
                {'detail': f'Valeurs numériques invalides: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if price < 0 or max_churches < 1 or max_members < 1:
            return Response(
                {'detail': 'price doit être >= 0, max_churches et max_members doivent être >= 1'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            plan = BillingPlan.objects.create(
                code=code,
                name=name,
                price=price,
                currency=currency,
                max_churches=max_churches,
                max_members=max_members,
            )

            return Response(
                {
                    'id': plan.id,
                    'code': plan.code,
                    'name': plan.name,
                    'price': str(plan.price),
                    'currency': plan.currency,
                    'max_churches': plan.max_churches,
                    'max_members': plan.max_members,
                    'message': 'Plan de facturation créé avec succès'
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BillingPlanDetailView(APIView):
    permission_classes = [IsInternalAdminOrMod]
    authentication_classes = []
    
    """GET: Get a billing plan; PUT/PATCH: Update a billing plan; DELETE: Delete a billing plan"""
    def get(self, request, plan_id):
        """Get a specific billing plan"""
        plan = BillingPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response(
                {'detail': 'Plan non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = {
            'id': plan.id,
            'code': plan.code,
            'name': plan.name,
            'price': str(plan.price),
            'currency': plan.currency,
            'max_churches': plan.max_churches,
            'max_members': plan.max_members,
            'created_at': plan.created_at,
            'updated_at': plan.updated_at,
            'tenants_count': plan.tenants.count(),
        }
        return Response(data)

    def put(self, request, plan_id):
        """Update a billing plan (all fields)"""
        plan = BillingPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response(
                {'detail': 'Plan non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        code = request.data.get('code', plan.code).strip().lower()
        name = request.data.get('name', plan.name).strip()
        price = request.data.get('price', plan.price)
        currency = request.data.get('currency', plan.currency).strip()
        max_churches = request.data.get('max_churches', plan.max_churches)
        max_members = request.data.get('max_members', plan.max_members)

        # Check if new code already exists (and is different from current)
        if code != plan.code and BillingPlan.objects.filter(code=code).exists():
            return Response(
                {'detail': f'Un plan avec le code "{code}" existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            price = float(price)
            max_churches = int(max_churches)
            max_members = int(max_members)
        except ValueError as e:
            return Response(
                {'detail': f'Valeurs numériques invalides: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if price < 0 or max_churches < 1 or max_members < 1:
            return Response(
                {'detail': 'price doit être >= 0, max_churches et max_members doivent être >= 1'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            plan.code = code
            plan.name = name
            plan.price = price
            plan.currency = currency
            plan.max_churches = max_churches
            plan.max_members = max_members
            plan.save()

            return Response(
                {
                    'id': plan.id,
                    'code': plan.code,
                    'name': plan.name,
                    'price': str(plan.price),
                    'currency': plan.currency,
                    'max_churches': plan.max_churches,
                    'max_members': plan.max_members,
                    'message': 'Plan de facturation mis à jour avec succès'
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def delete(self, request, plan_id):
        """Delete a billing plan"""
        plan = BillingPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response(
                {'detail': 'Plan non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if plan is in use by any tenant
        if plan.tenants.exists():
            return Response(
                {'detail': f'Impossible de supprimer ce plan. Il est utilisé par {plan.tenants.count()} locataire(s)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            plan_name = plan.name
            plan.delete()

            return Response(
                {'message': f'Plan "{plan_name}" supprimé avec succès'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
