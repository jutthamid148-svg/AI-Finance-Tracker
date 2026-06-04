from django.urls import path
from . import views

urlpatterns = [
    path('', views.SavingsGoalListCreateView.as_view(), name='savings_list'),
    path('<uuid:pk>/', views.SavingsGoalDetailView.as_view(), name='savings_detail'),
    path('<uuid:pk>/add/', views.AddToSavingsView.as_view(), name='add_savings'),
]
