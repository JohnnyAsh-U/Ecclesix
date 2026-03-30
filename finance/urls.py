from django.urls import path
from . import views, views2

urlpatterns = [
    path('', views2.ChurchAndAccounts.as_view(), name="church-accounts"),
    path('/account-balance', views2.AccountsBalances.as_view(), name="account-balance"),
    path('/categories', views2.CategoryListCreateView.as_view(), name="category-create-list"),
    path('/categories/<int:pk>', views2.CategoryRUDView.as_view(), name="category-rud"),
    path('/regles', views2.TransactionRuleListCreateView.as_view(), name="rule-create-list"),
    path('/regles/<int:pk>', views2.TransactionRuleRUDView.as_view(), name="rule-rud"),
    path('/comptes', views2.AccountCreateListView.as_view(), name="account-create-list"),
    path('/comptes/<int:pk>', views2.AccountRUDView.as_view(), name="account-rud"),
    path('/rapports', views2.Report.as_view(), name="report"),


    path('/transactions', views.TransactionListCreateView.as_view(), name="transaction-create-list"),
    path('/transactions/<int:pk>', views.TransactionValidateRejectDelete.as_view(), name="transaction-vrd"),
    path('/budgets', views.BudgetListCreateView.as_view(), name="budget-list-create"),
    path('/budgets/<int:pk>', views.BudgetRUDView.as_view(), name="budget-rud"),
    path('/budgets/<int:pk>/add-expense', views.BudgetAddExpenses.as_view(), name="budget-add-expense"),
    path('/transactions-logs/filters', views.TransactionLogTableData.as_view(), name="transaction-log-data"),
    path('/transactions-logs', views.TransactionLogTable.as_view(), name="transaction-log"),
]
