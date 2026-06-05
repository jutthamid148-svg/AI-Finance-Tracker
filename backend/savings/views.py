from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer
from users.models import Notification


class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)


class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        goal = serializer.save()
        if float(goal.current_amount) >= float(goal.target_amount) and not goal.is_completed:
            goal.is_completed = True
            goal.completed_at = timezone.now()
            goal.save()
            Notification.objects.create(
                user=self.request.user,
                title='Savings Goal Reached! 🎉',
                message=f'Congratulations! You have reached your savings goal: {goal.name}',
                notification_type='goal_reached'
            )


class AddToSavingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            goal = SavingsGoal.objects.get(id=pk, user=request.user)
            try:
                amount = float(request.data.get('amount', 0))
            except (ValueError, TypeError):
                return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
            if amount <= 0:
                return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)

            goal.current_amount = min(float(goal.current_amount) + amount, float(goal.target_amount))
            if float(goal.current_amount) >= float(goal.target_amount):
                goal.is_completed = True
                goal.completed_at = timezone.now()
                Notification.objects.create(
                    user=request.user,
                    title='Savings Goal Reached! 🎉',
                    message=f'You have reached your goal: {goal.name}',
                    notification_type='goal_reached'
                )
            goal.save()
            return Response(SavingsGoalSerializer(goal).data)
        except SavingsGoal.DoesNotExist:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
