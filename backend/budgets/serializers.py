# serializers.py
from rest_framework import serializers
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()
    percentage_used = serializers.ReadOnlyField()
    is_exceeded = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'amount', 'month', 'year',
            'spent', 'remaining', 'percentage_used', 'is_exceeded', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
