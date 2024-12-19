from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChurchAndAccounts.as_view(), name="church-accounts"),
    path('/account-balance', views.AccountsBalances.as_view(), name="account-balance"),
    path('/categories', views.CategoryListCreateView.as_view(), name="category-create-list"),
    path('/categories/<int:pk>', views.CategoryRUDView.as_view(), name="category-rud"),
    path('/regles', views.TransactionRuleListCreateView.as_view(), name="rule-create-list"),
    path('/regles/<int:pk>', views.TransactionRuleRUDView.as_view(), name="rule-rud"),
    path('/comptes', views.AccountCreateListView.as_view(), name="account-create-list"),
    path('/comptes/<int:pk>', views.AccountRUDView.as_view(), name="account-rud"),
    path('/transactions', views.TransactionListCreateView.as_view(), name="transaction-create-list"),
    path('/transactions/<int:pk>/action', views.TransactionValidateOrReject.as_view(), name="transaction-action"),
    path('/transactions-logs/filters', views.TransactionLogTableData.as_view(), name="transaction-log-data"),
    path('/transactions-logs', views.TransactionLogTable.as_view(), name="transaction-log"),
]
