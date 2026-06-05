from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
import datetime

from .models import Income, Expense
from .serializers import IncomeSerializer, ExpenseSerializer
from users.models import Notification


class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source', 'date']
    search_fields = ['description', 'source']
    ordering_fields = ['amount', 'date', 'created_at']

    def get_queryset(self):
        qs = Income.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        return qs


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'date']
    search_fields = ['description', 'category']
    ordering_fields = ['amount', 'date', 'created_at']

    def perform_create(self, serializer):
        expense = serializer.save()
        # Check if this expense pushes any budget over the limit
        try:
            from budgets.models import Budget
            budget = Budget.objects.filter(
                user=self.request.user,
                category=expense.category,
                month=expense.date.month,
                year=expense.date.year,
            ).first()
            if budget and budget.is_exceeded:
                Notification.objects.get_or_create(
                    user=self.request.user,
                    notification_type='budget_exceeded',
                    is_read=False,
                    defaults={
                        'title': f'Budget Exceeded: {expense.category.title()}',
                        'message': f'You have exceeded your {expense.category} budget for this month.',
                    }
                )
        except Exception:
            pass

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        category = self.request.query_params.get('category')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        if category:
            qs = qs.filter(category=category)
        return qs


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class MonthlyChartDataView(APIView):
    """Returns 6-month income vs expense trend data"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        months_data = []

        for i in range(5, -1, -1):
            d = today.replace(day=1) - datetime.timedelta(days=i * 28)
            month = d.month
            year = d.year
            month_name = d.strftime('%b %Y')

            income_total = Income.objects.filter(
                user=user, date__month=month, date__year=year
            ).aggregate(total=Sum('amount'))['total'] or 0

            expense_total = Expense.objects.filter(
                user=user, date__month=month, date__year=year
            ).aggregate(total=Sum('amount'))['total'] or 0

            months_data.append({
                'month': month_name,
                'income': float(income_total),
                'expenses': float(expense_total),
                'savings': float(income_total - expense_total),
            })

        return Response(months_data)


class CategorySpendingView(APIView):
    """Returns current month spending by category for pie chart"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        month = request.query_params.get('month', now.month)
        year = request.query_params.get('year', now.year)

        data = Expense.objects.filter(
            user=user, date__month=month, date__year=year
        ).values('category').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

        return Response([{
            'category': item['category'],
            'total': float(item['total']),
            'count': item['count'],
        } for item in data])
