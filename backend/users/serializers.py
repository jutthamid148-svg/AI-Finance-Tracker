from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Notification


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2', 'phone', 'currency']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'avatar', 'phone', 'currency', 'is_verified', 'is_staff', 'is_pro', 'pro_since', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'is_staff', 'is_pro', 'pro_since', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'currency', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match'})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    total_expenses = serializers.SerializerMethodField()
    total_income = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'currency', 'is_active', 'is_staff', 'is_verified', 'is_pro',
            'created_at', 'total_expenses', 'total_income',
        ]
        read_only_fields = ['id', 'email', 'created_at']

    def get_total_expenses(self, obj):
        from transactions.models import Expense
        from django.db.models import Sum
        total = Expense.objects.filter(user=obj).aggregate(t=Sum('amount'))['t']
        return float(total or 0)

    def get_total_income(self, obj):
        from transactions.models import Income
        from django.db.models import Sum
        total = Income.objects.filter(user=obj).aggregate(t=Sum('amount'))['t']
        return float(total or 0)
