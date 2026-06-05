from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Budget
from .serializers import BudgetSerializer
from users.models import Notification


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user)
        now = timezone.now()
        try:
            month_param = self.request.query_params.get('month')
            year_param = self.request.query_params.get('year')
            month = int(month_param) if month_param else now.month
            year = int(year_param) if year_param else now.year
            if not (1 <= month <= 12) or year < 2000:
                raise ValueError
        except (ValueError, TypeError):
            month, year = now.month, now.year
        qs = qs.filter(month=month, year=year)
        return qs

    def perform_create(self, serializer):
        budget = serializer.save()
        # Check if already exceeded
        if budget.is_exceeded:
            Notification.objects.create(
                user=self.request.user,
                title='Budget Exceeded',
                message=f'Your {budget.category} budget is already exceeded!',
                notification_type='budget_exceeded'
            )


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        budget = serializer.save()
        if budget.is_exceeded:
            Notification.objects.get_or_create(
                user=self.request.user,
                notification_type='budget_exceeded',
                title=f'Budget Exceeded: {budget.category.title()}',
                defaults={
                    'message': f'Your {budget.category} budget for this month is exceeded!',
                }
            )


class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        month = request.query_params.get('month', now.month)
        year = request.query_params.get('year', now.year)
        budgets = Budget.objects.filter(
            user=request.user, month=month, year=year
        )
        total_budget = sum(float(b.amount) for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        exceeded = [b.category for b in budgets if b.is_exceeded]

        return Response({
            'total_budget': total_budget,
            'total_spent': total_spent,
            'total_remaining': total_budget - total_spent,
            'budget_count': budgets.count(),
            'exceeded_categories': exceeded,
            'success_rate': round((1 - len(exceeded) / max(budgets.count(), 1)) * 100, 1),
        })
