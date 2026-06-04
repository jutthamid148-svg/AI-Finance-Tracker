from django.urls import path
from . import views

urlpatterns = [
    path('income/', views.IncomeListCreateView.as_view(), name='income_list'),
    path('income/<uuid:pk>/', views.IncomeDetailView.as_view(), name='income_detail'),
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expense_list'),
    path('expenses/<uuid:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
    path('charts/monthly/', views.MonthlyChartDataView.as_view(), name='monthly_chart'),
    path('charts/categories/', views.CategorySpendingView.as_view(), name='category_chart'),
]
