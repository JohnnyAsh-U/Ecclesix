from django.urls import path
from . import views

urlpatterns = [
    path('/categories', views.CategoryListCreateView.as_view(), name="category-create-list"),
    path('/categories/<int:pk>', views.CategoryRUDView.as_view(), name="category-rud"),
    path('/regles', views.TransactionRuleListCreateView.as_view(), name="rule-create-list"),
    path('/regles/<int:pk>', views.TransactionRuleRUDView.as_view(), name="rule-rud"),
    
]
