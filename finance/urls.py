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
    path('/transactions', views.AccountRUDView.as_view(), name="account-rud"),
]
