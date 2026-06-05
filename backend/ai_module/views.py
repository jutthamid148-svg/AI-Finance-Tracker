from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .analyzer import FinanceAnalyzer


class SpendingAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analyzer = FinanceAnalyzer(request.user)
        return Response(analyzer.get_spending_analysis())


class OverspendingDetectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analyzer = FinanceAnalyzer(request.user)
        return Response(analyzer.detect_overspending())


class RecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analyzer = FinanceAnalyzer(request.user)
        return Response({'recommendations': analyzer.generate_recommendations()})


class PredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analyzer = FinanceAnalyzer(request.user)
        expense_prediction = analyzer.predict_next_month_expenses()
        savings_prediction = analyzer.predict_savings()
        return Response({
            'expense_prediction': expense_prediction,
            'savings_prediction': savings_prediction,
        })


class FullInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analyzer = FinanceAnalyzer(request.user)
        return Response({
            'spending_analysis': analyzer.get_spending_analysis(),
            'overspending': analyzer.detect_overspending(),
            'recommendations': analyzer.generate_recommendations(),
            'predictions': analyzer.predict_next_month_expenses(),
            'savings_predictions': analyzer.predict_savings(),
            'health_score': analyzer.get_financial_health_score(),
        })


class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question = request.data.get('message', '').strip()
        if not question:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        analyzer = FinanceAnalyzer(request.user)
        response = analyzer.chat_response(question)
        return Response({'response': response, 'question': question})
