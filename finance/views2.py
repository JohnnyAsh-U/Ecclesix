from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,

)
from .serializers import (
    CategorySerializer,
    RuleSerializer,
    AccountSerializer,
)
from .models import (
    Category,
    Transaction_Rule,
    Account,
    Transaction,
    Monthly_Balance,
    Transaction_Log,
    Account,
)
from event.models import Event
from rest_framework.views import APIView
from admin_custom.models import Log
from admin_custom.services import ViewLogger
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status
from django.db.models import Sum
from church.models import Church
from church.serializers import SimpleChurchSerializer
from decimal import Decimal
from datetime import date
from dateutil.relativedelta import *
from members.models import Member
from django.db import transaction
from .services import report_table
import copy
from django.db.models import Q
from rest_framework.exceptions import ParseError





class CategoryListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = {
            "resource": "Categorie",
            "id": serializer.data["id"],
            "lib": serializer.data["category_name"],
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CategoryRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {"resource": "Categorie", "id": instance.pk, "lib": str(instance)}
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionRuleListCreateView(ListCreateAPIView):

    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }
    serializer_class = RuleSerializer
    queryset = Transaction_Rule.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        church = SimpleChurchSerializer(Church.objects.all(), many=True)
        category = CategorySerializer(
            Category.objects.filter(category_type="Credit"), many=True
        )
        account = AccountSerializer(
            Account.objects.filter(account_type="Caisse"), many=True
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "rules": serializer.data,
                "church": church.data,
                "category": category.data,
                "account": account.data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.check_percentage(request.data)
        self.perform_create(serializer)
        detail = {
            "resource": "Regle",
            "id": serializer.data["id"],
            "lib": f"{serializer.data['rule_name']} ({serializer.data['church_name']})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def check_percentage(self, data):
        percentage_sum = Transaction_Rule.objects.filter(
            church_id=data["church"], category_id=data["category"]
        ).aggregate(percent_sum=Sum("percentage"))
        if percentage_sum["percent_sum"]:
            # to convert the float percentage from frontend to 3 digit decimal number
            percentage = Decimal(data['percentage']).quantize(Decimal('0.001'))
            if (percentage_sum["percent_sum"] + percentage) > 100.00:
                raise ValidationError("Not Valid")


class TransactionRuleRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = RuleSerializer
    queryset = Transaction_Rule.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.check_percentage(instance, percent=request.data["percentage"])
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Regle",
            "id": instance.pk,
            "lib": f"{instance.rule_name} ({instance.church.church_name})",
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def check_percentage(self, data, percent):
        percentage_sum = (
            Transaction_Rule.objects.filter(church=data.church, category=data.category)
            .exclude(id=data.pk)
            .aggregate(percent_sum=Sum("percentage"))
        )
        if percentage_sum["percent_sum"]:
            if (percentage_sum["percent_sum"] + Decimal(percent)) > 100.00:
                raise ValidationError("Not Valid")


class AccountCreateListView(ListCreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["superadmin"],
        "POST": ["superadmin"],
    }
    serializer_class = AccountSerializer
    queryset = Account.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                self.check_church_main_account(serializer.data)
                self.update_monthly_balance(serializer.data)
                detail = {
                    "resource": "Compte",
                    "id": serializer.data["id"],
                    "lib": f"{serializer.data['account_name']} ({serializer.data['church_name']})",
                }
                Log.objects.create(
                    admin_id=request.user.id, log_type="INSERT", detail=detail
                )
                headers = self.get_success_headers(serializer.data)
                return Response(
                    serializer.data, status=status.HTTP_201_CREATED, headers=headers
                )

        except BaseException as m:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        church = SimpleChurchSerializer(Church.objects.all(), many=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "accounts": serializer.data,
                "church": church.data,
            }
        )

    def check_church_main_account(self, data):
        account = Account.objects.filter(
            church_id=data["church"], account_type=data["account_type"], is_main=True
        ).exists()
        if not account:
            acc = Account.objects.get(id=data["id"])
            acc.is_main = True
            acc.save()

    def update_monthly_balance(self, data):
        Monthly_Balance.objects.create(
            month=date.today().month,
            year=date.today().year,
            account_id=data["id"],
            balance=data["balance"],
        )


class AccountRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PATCH": ["superadmin"],
        "DELETE": ["superadmin"],
    }
    serializer_class = AccountSerializer
    queryset = Account.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, context={"request": request}, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        detail = {
            "resource": "Compte",
            "id": instance.pk,
            "lib": f"{instance.account_name}",
        }
        self.perform_destroy(instance)
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChurchAndAccounts(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_finance", "voir_toutes_finances"],
    }

    def get(self, request, *args, **kwargs):
        user: Member = request.user
        event_queryset = Event.objects.filter(
            event_date__range=(
                date.today() + relativedelta(weeks=-1, weekday=MO(+1)),
                date.today() + relativedelta(weekday=SU(+1)),
            )
        ).prefetch_related("church", "event_type")
        church_queryset = Church.objects.prefetch_related("account_set")
        if not user.is_superuser and not user.has_perm_custom("voir_toutes_finances"):
            event_queryset = event_queryset.filter(
                church=user.church,
            )
            church_queryset = church_queryset.filter(id=user.church_id)

        # manual serializing
        church_accounts = []
        for church in church_queryset:
            accounts = church.account_set.all()
            if accounts:
                ch_s = dict(SimpleChurchSerializer(church).data)
                ch_s["accounts"] = []
                for acc in accounts:
                    acc_s = AccountSerializer(acc).data
                    ch_s["accounts"].append(acc_s)
                church_accounts.append(ch_s)

        first_transaction_date = Transaction.objects.order_by("created_at").first()

        account_serializer = AccountSerializer(Account.objects.all(), many=True)
        category_serializer = CategorySerializer(Category.objects.all(), many=True)
        event_list = [
            {
                "id": ev.id,
                "event": f"{ev.church} - {ev.event_type} ({str(ev.event_date)})",
            }
            for ev in event_queryset
        ]

        return Response(
            {
                "events": event_list,
                "date": getattr(first_transaction_date, "created_at", "01-01-2024"),
                "category": category_serializer.data,
                "account": account_serializer.data,
                "church_account": church_accounts,
            }
        )


class AccountsBalances(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_finance", "voir_toutes_finances"],
    }

    def get(self, request, *args, **kwargs):
        query_params = request.query_params
        church = query_params.get("eglise", None)
        account_type = query_params.get("type", None)

        if church and account_type:
            query_set = AccountSerializer(
                Account.objects.filter(church_id=church, account_type=account_type),
                many=True,
            ).data
            return Response(query_set)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class Report(APIView):
    perms = {"GET": ["voir_finance", "voir_toutes_finances"]}

    def get(self, request, *args, **kwargs):
        user: Member = request.user
        query = self.request.query_params
        acc_type = query.get("type", None)
        church = query.get("id_eglise", request.user.church_id)
        month = int(query.get("mois", date.today().month - 1))
        year = int(query.get("annee", date.today().year))

        if not acc_type or not church:
            raise ParseError("Not valid")

        # just to make sure user can only see their church report except
        # if it's  superuser or user with see all report perm
        if not user.is_superuser and not user.has_perm_custom("voir_toutes_finances"):
            church = user.church_id

        # get the church accounts using the church and type params
        # for querying the transactions
        accounts = self.church_accounts(church, acc_type)

        # filter using the church accounts and from month start to end
        queryset = (
            Transaction.objects.filter(
                Q(from_account_id__in=[acc["id"] for acc in accounts])
                | Q(to_account_id__in=[acc["id"] for acc in accounts])
            )
            .filter(
                updated_at__date__range=(
                    date(year, month + 1, 1),
                    date(year, month + 1, 1) + relativedelta(day=31),
                )
            )
            .filter(status="Validated")
        )

        all_categories = Category.objects.all()
        categories_report = []

        # append the accounts to each category
        for cat in all_categories:
            categories_report.append(
                {
                    "id": cat.id,
                    "category": cat.category_name,
                    "type": cat.category_type,
                    "accounts": copy.deepcopy(accounts),
                }
            )

        # make a deep copy of the array
        InitialBalance = copy.deepcopy(accounts)
        FinalBalance = copy.deepcopy(accounts)

        OpeningBalance = Monthly_Balance.objects.filter(
            month=month + 1, year=year, account__id__in=[acc["id"] for acc in accounts]
        )

        # update the final account variable and initial account variable with the opening account balance
        for obj in OpeningBalance:
            account_initial = next(
                (i for i in InitialBalance if i["id"] == obj.account_id), None
            )
            account_final = next((f for f in FinalBalance if f["id"] == obj.account_id), None)

            if account_initial:
                account_initial["balance"] += obj.balance

            if account_final:
                account_final["balance"] += obj.balance

        data = report_table(
            accounts,
            InitialBalance,
            # TotalExpenses,
            # TotalTransferIn,
            # TotalTransferOut,
            # TotalIncome,
            FinalBalance,
            categories_report,
            queryset,
        )

        ViewLogger(request.user.id, {"resource": "Finance - Rapports"})
        # data = {
        #     "accountsName": FinalBalance,
        #     "accountCols": accounts,
        #     "InitialBalance" : InitialBalance,
        #     "TotalExpenses": TotalExpenses,
        #     "TotalTransferIn": TotalTransferIn,
        #     "TotalTransferOut": TotalTransferOut,
        #     "TotalIncome": TotalIncome,
        #     "rapportCategories": categories_report
        # }
        return Response(data)

    def church_accounts(self, church_id, acc_type):
        accs = Account.objects.filter(church_id=church_id, account_type=acc_type)
        return [
            {
                "id": acc.id,
                "name": acc.account_name,
                "is_main": acc.is_main,
                "balance": Decimal(0.00),
            }
            for acc in accs
        ]
