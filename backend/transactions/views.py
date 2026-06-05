import functools
import operator
from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ParseError
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils import timezone
import datetime

from .models import Income, Expense
from .serializers import IncomeSerializer, ExpenseSerializer
from users.models import Notification


def _validated_month_year(query_params):
    """Returns (month_int, year_int) or raises ParseError."""
    month = query_params.get('month')
    year = query_params.get('year')
    try:
        m = int(month) if month else None
        y = int(year) if year else None
        if m is not None and not (1 <= m <= 12):
            raise ValueError
    except (ValueError, TypeError):
        raise ParseError('month must be an integer between 1 and 12, year must be a valid integer')
    return m, y


class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source', 'date']
    search_fields = ['description', 'source']
    ordering_fields = ['amount', 'date', 'created_at']

    def get_queryset(self):
        qs = Income.objects.filter(user=self.request.user)
        month, year = _validated_month_year(self.request.query_params)
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
                now = timezone.now()
                already_notified = Notification.objects.filter(
                    user=self.request.user,
                    notification_type='budget_exceeded',
                    title=f'Budget Exceeded: {expense.category.title()}',
                    created_at__month=now.month,
                    created_at__year=now.year,
                ).exists()
                if not already_notified:
                    Notification.objects.create(
                        user=self.request.user,
                        notification_type='budget_exceeded',
                        title=f'Budget Exceeded: {expense.category.title()}',
                        message=f'You have exceeded your {expense.category} budget for this month.',
                    )
        except Exception:
            pass

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        month, year = _validated_month_year(self.request.query_params)
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
    """Returns 6-month income vs expense trend data (2 DB queries instead of 12)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Build the 6 calendar month/year pairs
        month_year_pairs = []
        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year + (m - 1) // 12
            m = ((m - 1) % 12) + 1
            month_year_pairs.append((y, m))

        filter_q = functools.reduce(operator.or_, [
            Q(date__year=y, date__month=m) for y, m in month_year_pairs
        ])

        income_map = {
            (r['date__year'], r['date__month']): float(r['total'])
            for r in Income.objects.filter(user=user).filter(filter_q)
                .values('date__year', 'date__month')
                .annotate(total=Sum('amount'))
        }
        expense_map = {
            (r['date__year'], r['date__month']): float(r['total'])
            for r in Expense.objects.filter(user=user).filter(filter_q)
                .values('date__year', 'date__month')
                .annotate(total=Sum('amount'))
        }

        months_data = []
        for y, m in month_year_pairs:
            d = today.replace(year=y, month=m, day=1)
            inc = income_map.get((y, m), 0.0)
            exp = expense_map.get((y, m), 0.0)
            months_data.append({
                'month': d.strftime('%b %Y'),
                'income': inc,
                'expenses': exp,
                'savings': inc - exp,
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
