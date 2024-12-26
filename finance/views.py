from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
    ListAPIView,
    CreateAPIView,
)
from .serializers import (
    CategorySerializer,
    RuleSerializer,
    AccountSerializer,
    TransactionSerializer,
    TransactionLogSerializer,
    BudgetSerializer,
)
from rest_framework.exceptions import ParseError
from .models import (
    Category,
    Transaction_Rule,
    Account,
    Transaction,
    Monthly_Balance,
    Transaction_Log,
    Budget,
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
from datetime import date, datetime
from dateutil.relativedelta import *
from members.models import Member
from django.db import transaction
from django.db.models import Q
from .services import transaction_table, report_table
from .utils import encrypt_amount
import copy


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
            if (percentage_sum["percent_sum"] + Decimal(data["percentage"])) > 100.00:
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


class TransactionListCreateView(ListCreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_finance", "voir_toutes_finances"],
        "POST": ["ajouter_transaction"],
    }
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

    def list(self, request, *args, **kwargs):
        user: Member = request.user
        query = self.request.query_params
        acc_type = query.get("type", None)
        category = query.get("categorie", None)
        church = query.get("id_eglise", request.user.church_id)
        month = int(query.get("mois", date.today().month - 1))
        year = int(query.get("annee", date.today().year))

        if not acc_type or not category:
            raise ParseError("Not valid")

        # just to make sure user can only see their church transactions except
        # if it's  superuser or user with see all transactions perm
        if not user.is_superuser and not user.has_perm_custom("voir_toutes_finances"):
            church = user.church_id

        # get the church accounts using the church and type params
        # for querying the transactions
        accounts = self.church_accounts(church, acc_type)

        # filter using the church accounts and from month start to end
        queryset = (
            self.get_queryset()
            .filter(
                Q(from_account_id__in=[acc["id"] for acc in accounts])
                | Q(to_account_id__in=[acc["id"] for acc in accounts])
            )
            .filter(
                updated_at__date__range=(
                    date(year, month + 1, 1),
                    date(year, month + 1, 1) + relativedelta(day=31),
                )
            )
        )

        # to set the option category or type for query
        category = self.category(category)
        if category in ["Debit", "Credit", "Transfer"]:
            queryset = queryset.filter(transaction_type=category)
        elif category and category.isnumeric():
            queryset = queryset.filter(category_id=category)

        # the pending transaction only displays in superadmin and admin with ajouter transaction and
        # confirmer transaction and superadmins
        if (
            not user.is_superuser
            and not user.has_perm_custom("ajouter_transaction")
            and not user.has_perm_custom("confirmer_transaction")
        ):
            queryset = queryset.filter(status__in=["Validated", "Rejected"])

        serializer = self.get_serializer(
            queryset,
            many=True,
            context={"request": request, "accounts": accounts},
        )
        transactions = transaction_table(serializer.data)
        ViewLogger(admin_id=user.id, detail={"resource": "Finance - Transactions"})
        return Response({"res": transactions, "accounts": accounts})

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                transaction_type = data["type"]
                if transaction_type == "Credit":
                    self.credit_transaction(request, data)
                elif transaction_type == "Debit":
                    self.debit_transaction(request, data)
                elif transaction_type == "Transfer":
                    self.transfer_transaction(request, data)
                else:
                    raise ParseError("Not Valid")
            return Response(status=status.HTTP_201_CREATED)
        except BaseException as m:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def credit_transaction(self, request, data):
        from_account = Account.objects.get(
            church_id=data["church"], account_type="Caisse", is_main=True
        )
        serializer = self.get_serializer(
            data={
                "description": data["description"],
                "amount": data["amount"],
                "category": data["category"],
                "event": data["event"],
                "transaction_type": data["type"],
                "from_account": from_account.pk,
                "added_by": request.user.id,
            }
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        self.check_credit_transaction_rules(serializer.data)
        self.logger(request, serializer.data)

    def check_credit_transaction_rules(self, data):
        category = data["category"]
        church = data["church"]["id"]
        rules = Transaction_Rule.objects.filter(category_id=category, church_id=church)
        if rules.exists():
            for rule in rules:
                calculated_amount = (Decimal(rule.percentage) / 100) * Decimal(
                    data["amount"]
                )
                rule_transaction = self.get_serializer(
                    data={
                        "description": data["description"],
                        "amount": str(calculated_amount),
                        "category": data["category"],
                        "transaction_type": data["transaction_type"],
                        "from_account": data["from_account"],
                        "to_account": rule.account_id,
                        "added_by": data["added_by"],
                        "parent": data["id"],
                    }
                )
                rule_transaction.is_valid(raise_exception=True)
                self.perform_create(rule_transaction)

    def debit_transaction(self, request, data):
        from_account = Account.objects.get(id=data["from_account"])
        if from_account.balance < Decimal(str(data["amount"])):
            raise ValidationError("Solde Insuffisant")

        serializer = self.get_serializer(
            data={
                "description": data["description"],
                "amount": data["amount"],
                "category": data["category"],
                "transaction_type": data["type"],
                "from_account": from_account.pk,
                "added_by": request.user.id,
            }
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        self.logger(request, serializer.data)

    def transfer_transaction(self, request, data):
        from_account = Account.objects.get(id=data["from_account"])
        to_account = Account.objects.get(id=data["to_account"])
        if from_account.balance < Decimal(str(data["amount"])):
            raise ValidationError("Solde Insuffisant")

        serializer = self.get_serializer(
            data={
                "description": data["description"],
                "amount": data["amount"],
                "transaction_type": data["type"],
                "from_account": from_account.pk,
                "to_account": to_account.pk,
                "added_by": request.user.id,
            }
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        self.logger(request, serializer.data)

    def logger(self, request, instance):
        category = instance["category_name"]
        from_account = instance["from_account_name"]
        church = instance["church"]["name"]
        to_account = instance["to_account_name"]
        transactionType = {
            "Debit": "Depense",
            "Credit": "Collecte",
            "Transfer": "Transfert",
        }
        Transaction_Log.objects.create(
            action="Created",
            transaction_no=instance["id"],
            admin=request.user,
            detail={
                "categorie": category,
                "montant": instance["amount"],
                "transaction": transactionType[instance["transaction_type"]],
                "compte": from_account,
                "au_compte": to_account,
            },
        )
        detail = {
            "resource": "Transaction",
            "id": instance["id"],
            "lib": f"#{instance['id']} {transactionType[instance["transaction_type"]]} ({church})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)

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

    def category(self, cat):
        if cat and cat != "tout":
            if cat == "tout_depenses":
                return "Debit"
            elif cat == "tout_dons":
                return "Credit"
            elif cat == "tout_transferts":
                return "Transfer"
            else:
                return cat


class TransactionValidateRejectDelete(UpdateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "PUT": ["confirmer_transaction"],
        "DELETE": ["ajouter_transaction"],
    }
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

    def update(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                action = data["action"]
                if action == "Validate":
                    self.validate(request)
                elif action == "Reject":
                    self.reject(request)
                else:
                    raise ParseError("Not Valid")
            return Response(status=status.HTTP_201_CREATED)
        except BaseException as m:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def validate(self, request):
        instance: Transaction = self.get_object()
        data = request.data
        comment = data.get("notes", None)
        if instance.transaction_type == "Credit":
            acc = instance.from_account
            acc.balance = acc.balance + instance.amount
            acc.save()
            # get the children tranfer transaction
            children_trans = instance.transaction_set.all()

            if children_trans:
                for t in children_trans:
                    parent_acc_balance = instance.from_account.balance
                    child_acc_balance = t.to_account.balance

                    # deduct the child transaction amount from the parent acc
                    if parent_acc_balance < t.amount:
                        raise ValueError("Not Valid")
                    instance.from_account.balance = parent_acc_balance - t.amount
                    # add the child transaction amount to the (to_account) acc
                    t.to_account.balance = child_acc_balance + t.amount

                    # save the account balance
                    t.to_account.save()
                    instance.from_account.save()

                    # confirm the child transaction
                    t.status = "Validated"
                    t.approved_by = request.user
                    t.save()

            serializer = self.get_serializer(
                instance,
                data={
                    "status": "Validated",
                    "approved_by": request.user.id,
                },
                partial=True,
                context={"comment": comment, "request": request},
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        elif instance.transaction_type == "Debit":
            acc = instance.from_account
            if acc.balance < instance.amount:
                raise ValueError("Solde Insuffisant")

            # Deduct the money to the account
            acc.balance = acc.balance - instance.amount

            # update the actual amount on the budget
            if instance.budget:
                budget = instance.budget
                budget.actual_amount = budget.actual_amount + instance.amount
                instance.budget.save()

            acc.save()

            serializer = self.get_serializer(
                instance,
                data={
                    "status": "Validated",
                    "approved_by": request.user.id,
                },
                partial=True,
                context={"comment": comment, "request": request},
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        elif instance.transaction_type == "Transfer":
            debit_acc = instance.from_account
            credit_acc = instance.to_account
            if debit_acc.balance < credit_acc.balance:
                raise ValueError("Solde Insuffisant")

            # Deduct the money to the account
            debit_acc.balance = debit_acc.balance - instance.amount

            # credit the money to the account
            credit_acc.balance = credit_acc.balance + instance.amount

            debit_acc.save()
            credit_acc.save()

            serializer = self.get_serializer(
                instance,
                data={
                    "status": "Validated",
                    "approved_by": request.user.id,
                },
                partial=True,
                context={"comment": comment, "request": request},
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        else:
            raise Exception()

    def reject(self, request):
        instance = self.get_object()
        data = request.data
        comment = data.get("notes", None)

        if instance.transaction_type == "Credit":
            # get the children tranfer transaction
            children_trans = instance.transaction_set.all()
            if children_trans:
                for t in children_trans:
                    # reject the child transaction
                    t.status = "Rejected"
                    t.approved_by = request.user
                    t.save()

        serializer = self.get_serializer(
            instance,
            data={
                "status": "Rejected",
                "approved_by": request.user.id,
            },
            partial=True,
            context={"comment": comment, "request": request},
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

    def check_object_permissions(self, request, obj):
        """
        Check if the request should be permitted for a given object.
        Raises an appropriate exception if the request is not permitted.
        """
        # checks if the transaction has been confirmed or rejected
        # if so return a bad request
        if obj.status == "Validated" or obj.status == "Rejected":
            self.permission_denied(request, message="Not Pending", code="400")

        # checks if the admin that created the transaction is not
        # same admin that confirms it
        if obj.added_by_id == request.user.id:
            self.permission_denied(request, message="Own Transaction", code="400")

        # checks if its a credit transaction and if the has a parent id
        # meaning rule based transaction cannot be validated as standalone
        # but only with their parent transaction
        if obj.transaction_type == "Credit" and obj.parent:
            self.permission_denied(request, message="Rule Transaction", code="400")

        # //checks if the admin isnt a superadmin, and so the church of the admin
        # //must match the church of the account that made the transaction
        if (
            not request.user.is_superuser
            and obj.from_account.church_id != request.user.church_id
        ):
            self.permission_denied(request, message="No Perm", code="400")

    def delete(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                id = kwargs[self.lookup_field]
                transaction_french = {
                    "Debit": "Depense",
                    "Credit": "Collecte",
                    "Transfer": "Transfert",
                }
                instance = Transaction.objects.get(id=id)
                self.check_delete_permissions(request, instance)
                notes = request.query_params.get("notes", None)
                Transaction_Log.objects.create(
                    action="Deleted",
                    transaction_no=instance.pk,
                    admin_id=request.user.id,
                    detail={
                        "categorie": str(instance.category),
                        "montant": str(instance.amount),
                        "transaction": transaction_french[instance.transaction_type],
                        "compte": str(instance.from_account),
                        "au_compte": str(instance.to_account),
                    },
                    comment=notes,
                )
                detail = {
                    "resource": "Transaction",
                    "id": instance.pk,
                    "lib": f"#{instance.id} {transaction_french[instance.transaction_type]} ({instance.get_church()})",
                }
                Log.objects.create(
                    admin_id=request.user.id, log_type="DELETE", detail=detail
                )
                instance.delete()
            return Response(status=status.HTTP_201_CREATED)
        except BaseException as m:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def check_delete_permissions(self, request, obj):
        if obj.status != "Pending" or obj.approved_by_id or obj.parent_id:
            self.permission_denied(request, message="Not Pending", code="400")

        if obj.added_by_id != request.user.id:
            self.permission_denied(request, message="Not admin transaction", code="400")


class BudgetListCreateView(ListCreateAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_finance", "voir_toutes_finances"],
        "POST": ["ajouter_budget"],
    }
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()

    def list(self, request, *args, **kwargs):
        user = request.user
        query = self.request.query_params
        church = query.get("id_eglise", None)
        category = query.get("id_categorie", None)
        month = int(query.get("mois", date.today().month - 1))
        year = int(query.get("annee", date.today().year))

        if not user.is_superuser and not user.has_perm_custom("voir_toutes_finances"):
            church = user.church_id

        queryset = self.get_queryset()

        if month != "tout":
            queryset = queryset.filter(
                start_date__lte=date(year, month + 1, 1) + relativedelta(day=31),
            ).filter(end_date__gte=date(year, month + 1, 1))

        if category and category != "tout":
            queryset = queryset.filter(category_id=category)

        queryset = queryset.filter(account__church__id=church).filter(
            account__account_type="Caisse"
        )
        serializer = self.get_serializer(queryset, many=True)

        ViewLogger(user.id, {"resource": "Finance - Budgets"})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        detail = {
            "resource": "Budget",
            "id": serializer.data["id"],
            "lib": f"{serializer.data['budget_name']} ({serializer.data['church_name']})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class BudgetRUDView(RetrieveUpdateDestroyAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_finance", "voir_toutes_finances"],
        "PATCH": ["ajouter_budget"],
        "DELETE": ["superAdmin"],
    }
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        trans = TransactionSerializer(instance.transaction_set.all(), many=True)
        details = {}
        budget_details = instance.details
        for b in budget_details:
            admin = Member.objects.filter(id=budget_details[b]["admin"]).first()
            details[b] = {**budget_details[b], "admin": admin.get_full_name()}
        return Response({"data": trans.data, "details": details})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        data = request.data
        action = data.pop("action", None)
        if action == "all":
            serializer = self.get_serializer(
                instance, data=request.data, partial=partial
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        elif action == "amount":
            amount = data.get("amount", None)
            extension_no = len(instance.details)
            instance.details = {
                **instance.details,
                f"{extension_no+1}": {
                    "admin": request.user.id,
                    "extension": "amount",
                    "old": instance.allocated_amount,
                    "new": str(instance.allocated_amount + Decimal(amount)),
                    "date": str(datetime.now()),
                },
            }
            instance.allocated_amount = instance.allocated_amount + Decimal(amount)
            instance.save()
        elif action == "date":
            new_date = data.get("date", None)
            extension_no = len(instance.details)
            instance.details = {
                **instance.details,
                f"{extension_no+1}": {
                    "admin": request.user.id,
                    "extension": "date",
                    "old": str(instance.end_date),
                    "new": new_date,
                    "date": str(datetime.now()),
                },
            }
            instance.end_date = new_date
            instance.save()
        else:
            raise ParseError()
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        church = str(getattr(instance.account, "church", None))
        detail = {
            "resource": "Budget",
            "id": instance.id,
            "lib": f"{instance.budget_name} ({church})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="DELETE", detail=detail)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BudgetAddExpenses(CreateAPIView):
    perms = {"POST": ["ajouter_transaction"]}
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        validated_data = self.validate(request, pk, request.data)
        serializer = self.get_serializer(data=validated_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        self.logger(request, serializer.data)
        return Response(status=status.HTTP_201_CREATED)

    def validate(self, request, pk, data):
        amount = Decimal(data.get("amount", 0))
        if not amount:
            raise ValidationError("Amount Not Valid")
        budget = Budget.objects.get(id=pk)
        if date.today() > budget.end_date:
            raise ValidationError("Budget Closed")
        if amount > (budget.allocated_amount - budget.actual_amount):
            raise ValidationError("Solde Insuffisant")
        acc = budget.account
        if acc.balance < amount:
            raise ValidationError("Solde Insuffisant")

        return {
            **data,
            "transaction_type": "Debit",
            "status": "Pending",
            "from_account": acc.pk,
            "added_by": request.user.id,
            "budget": pk,
        }

    def logger(self, request, instance):
        category = instance["category_name"]
        from_account = instance["from_account_name"]
        church = instance["church"]["name"]
        transactionType = {
            "Debit": "Depense",
            "Credit": "Collecte",
            "Transfer": "Transfert",
        }
        Transaction_Log.objects.create(
            action="Created",
            transaction_no=instance["id"],
            admin=request.user,
            detail={
                "categorie": category,
                "montant": instance["amount"],
                "transaction": transactionType[instance["transaction_type"]],
                "compte": from_account,
                "budget": instance["budget_name"],
            },
        )
        detail = {
            "resource": "Transaction",
            "id": instance["id"],
            "lib": f"#{instance['id']} {transactionType[instance["transaction_type"]]} ({church})",
        }
        Log.objects.create(admin_id=request.user.id, log_type="INSERT", detail=detail)


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
                (i for i in InitialBalance if i["id"] == obj.pk), None
            )
            account_final = next((f for f in FinalBalance if f["id"] == obj.pk), None)

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


class TransactionLogTableData(APIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_financelog"],
    }

    def get(self, request, *args, **kwargs):
        admins = Member.objects.filter(
            role__permission__codename__in=["voir_finance", "voir_toutes_finances"]
        )
        superadmins = Member.objects.filter(is_superuser=True)
        all_admins = set([*admins, *superadmins])
        all_admins_list = [
            {"id": ad.pk, "name": ad.get_full_name()} for ad in all_admins
        ]
        firstDate = Transaction_Log.objects.order_by("created_at").first()

        return Response(
            data={
                "alladmins": all_admins_list,
                "first_date": getattr(firstDate, "created_at", "01-01-2024"),
            }
        )


class TransactionLogTable(ListAPIView):
    perms = {
        "OPTIONS": ["superadmin"],
        "GET": ["voir_financelog"],
    }
    queryset = Transaction_Log.objects.all()
    serializer_class = TransactionLogSerializer

    def list(self, request, *args, **kwargs):
        query = request.query_params
        action = query.get("action", None)
        admin = query.get("admin", None)
        search = query.get("search", None)
        month = int(query.get("mois", date.today().month - 1))
        year = int(query.get("annee", date.today().year))

        queryset = self.filter_queryset(self.get_queryset())

        if search:
            queryset = queryset.filter(transaction_no=int(search))

        if action and action != "tout":
            queryset = queryset.filter(action=action)

        if admin and admin != "tout":
            queryset = queryset.filter(admin_id=admin)

        queryset = queryset.filter(
            created_at__date__range=(
                date(year, month + 1, 1),
                date(year, month + 1, 1) + relativedelta(day=31),
            )
        ).order_by("-id")

        serializer = self.get_serializer(queryset, many=True)
        return Response({"logs": serializer.data})
