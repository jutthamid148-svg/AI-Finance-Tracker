from django.urls import path
from . import views

urlpatterns = [
    path('spending-analysis/', views.SpendingAnalysisView.as_view(), name='spending_analysis'),
    path('overspending/', views.OverspendingDetectionView.as_view(), name='overspending'),
    path('recommendations/', views.RecommendationsView.as_view(), name='recommendations'),
    path('predictions/', views.PredictionView.as_view(), name='predictions'),
    path('insights/', views.FullInsightsView.as_view(), name='full_insights'),
    path('chat/', views.ChatView.as_view(), name='ai_chat'),
]
