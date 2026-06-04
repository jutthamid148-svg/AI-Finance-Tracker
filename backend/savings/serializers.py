from rest_framework import serializers
from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'name', 'description', 'target_amount', 'current_amount',
            'target_date', 'icon', 'color', 'is_completed', 'completed_at',
            'progress_percentage', 'remaining_amount', 'created_at'
        ]
        read_only_fields = ['id', 'is_completed', 'completed_at', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
