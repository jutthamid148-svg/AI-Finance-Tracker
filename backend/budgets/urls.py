from django.urls import path
from . import views

urlpatterns = [
    path('', views.BudgetListCreateView.as_view(), name='budget_list'),
    path('<uuid:pk>/', views.BudgetDetailView.as_view(), name='budget_detail'),
    path('summary/', views.BudgetSummaryView.as_view(), name='budget_summary'),
]
