from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
import uuid
import requests as http_requests

from .models import User, Notification
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, NotificationSerializer, AdminUserSerializer
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ActiveUserTokenRefreshView(TokenRefreshView):
    """Token refresh that also checks if user is still active"""
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # Check if user is still active
        refresh_token = request.data.get('refresh', '')
        if refresh_token:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken as RT
                token = RT(refresh_token)
                user_id = token.payload.get('user_id')
                if user_id:
                    user = User.objects.filter(id=user_id).first()
                    if user and not user.is_active:
                        return Response(
                            {'detail': 'User account has been deactivated'},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
            except (TokenError, Exception):
                return Response(
                    {'detail': 'Token is invalid or expired'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email
        try:
            send_mail(
                subject='Verify Your AI Finance Tracker Account',
                message=f'Click to verify: {settings.FRONTEND_URL}/verify-email/{user.email_verification_token}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Account created successfully. Please verify your email.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        try:
            user = User.objects.get(email_verification_token=token)
            user.is_verified = True
            user.email_verification_token = uuid.uuid4()
            user.save()
            return Response({'message': 'Email verified successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            from django.utils import timezone
            user.password_reset_token = uuid.uuid4()
            user.password_reset_created_at = timezone.now()
            user.save()
            send_mail(
                subject='Reset Your AI Finance Tracker Password',
                message=f'Reset link: {settings.FRONTEND_URL}/reset-password/{user.password_reset_token}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        return Response({'message': 'If the email exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(password_reset_token=serializer.validated_data['token'])
            from django.utils import timezone
            from datetime import timedelta
            if not user.password_reset_created_at or \
               timezone.now() - user.password_reset_created_at > timedelta(hours=1):
                return Response({'error': 'Reset link has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.password_reset_token = None
            user.password_reset_created_at = None
            user.save()
            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            Notification.objects.filter(id=pk, user=request.user).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user).update(is_read=True)
        return Response({'message': 'Marked as read'})


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from transactions.models import Income, Expense
        from savings.models import SavingsGoal
        from django.db.models import Sum
        from django.utils import timezone

        user = request.user
        now = timezone.now()
        current_month = now.month
        current_year = now.year

        # Current month
        monthly_income = Income.objects.filter(
            user=user, date__month=current_month, date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_expenses = Expense.objects.filter(
            user=user, date__month=current_month, date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Previous month
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1

        prev_income = Income.objects.filter(
            user=user, date__month=prev_month, date__year=prev_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        prev_expenses = Expense.objects.filter(
            user=user, date__month=prev_month, date__year=prev_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_savings = SavingsGoal.objects.filter(
            user=user
        ).aggregate(total=Sum('current_amount'))['total'] or 0

        total_balance = monthly_income - monthly_expenses

        unread_notifications = Notification.objects.filter(
            user=user, is_read=False
        ).count()

        def pct_change(curr, prev):
            if prev == 0:
                return 0
            return round(((curr - prev) / prev) * 100, 1)

        return Response({
            'current_balance': float(total_balance),
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'total_savings': float(total_savings),
            'unread_notifications': unread_notifications,
            'income_change': pct_change(monthly_income, prev_income),
            'expense_change': pct_change(monthly_expenses, prev_expenses),
            'balance_change': pct_change(total_balance, float(prev_income) - float(prev_expenses)),
        })


# ─── Admin Views ───────────────────────────────────────────────────────────────

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class AdminUserListView(generics.ListAPIView):
    """Admin: list all users with their stats"""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', '')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        status_filter = self.request.query_params.get('status', '')
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)
        return qs


class AdminToggleUserActiveView(APIView):
    """Admin: activate or deactivate a user"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target_user.id == request.user.id:
            return Response({'error': 'You cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)

        target_user.is_active = not target_user.is_active
        target_user.save()

        action = 'activated' if target_user.is_active else 'deactivated'
        return Response({
            'message': f'User {action} successfully',
            'is_active': target_user.is_active,
            'user': AdminUserSerializer(target_user).data,
        })


class AdminVerifyUserView(APIView):
    """Admin: manually verify a user's email"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        target_user.is_verified = True
        target_user.save()
        return Response({
            'message': 'User verified successfully',
            'is_verified': True,
            'user': AdminUserSerializer(target_user).data,
        })


class AdminToggleProView(APIView):
    """Admin: toggle Pro status for a user"""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        from django.utils import timezone
        target_user.is_pro = not target_user.is_pro
        target_user.pro_since = timezone.now() if target_user.is_pro else None
        target_user.save()
        return Response({
            'message': f'User {"upgraded to Pro" if target_user.is_pro else "downgraded to Free"}',
            'is_pro': target_user.is_pro,
            'user': AdminUserSerializer(target_user).data,
        })


class AdminStatsView(APIView):
    """Admin: platform-wide statistics"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from transactions.models import Income, Expense
        from django.db.models import Sum, Count
        from django.utils import timezone

        now = timezone.now()

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(is_verified=True).count()
        new_users_this_month = User.objects.filter(
            created_at__month=now.month, created_at__year=now.year
        ).count()

        total_income = Income.objects.aggregate(t=Sum('amount'))['t'] or 0
        total_expenses = Expense.objects.aggregate(t=Sum('amount'))['t'] or 0

        # Users registered per month (last 6 months)
        from django.db.models.functions import TruncMonth
        monthly_registrations = (
            User.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        monthly_data = [
            {
                'month': item['month'].strftime('%b %Y'),
                'users': item['count'],
            }
            for item in monthly_registrations
        ]

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'verified_users': verified_users,
            'new_users_this_month': new_users_this_month,
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'monthly_registrations': monthly_data,
        })


class GoogleAuthView(APIView):
    """Sign in / sign up with Google via Firebase ID token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token    = request.data.get('id_token', '').strip()
        display_name = request.data.get('display_name', '')
        photo_url   = request.data.get('photo_url', '')

        if not id_token:
            return Response({'error': 'id_token is required'}, status=status.HTTP_400_BAD_REQUEST)

        firebase_api_key = getattr(settings, 'FIREBASE_API_KEY', '')
        if not firebase_api_key:
            return Response({'error': 'Firebase not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Verify token with Firebase Identity Toolkit (no firebase-admin needed)
        resp = http_requests.post(
            f'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}',
            json={'idToken': id_token},
            timeout=10,
        )

        if resp.status_code != 200:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

        data = resp.json()
        if not data.get('users'):
            return Response({'error': 'User not found in Firebase'}, status=status.HTTP_401_UNAUTHORIZED)

        firebase_user = data['users'][0]
        email = firebase_user.get('email', '')
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse name from displayName or photo URL
        name_parts = (display_name or firebase_user.get('displayName', '')).split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name  = name_parts[1] if len(name_parts) > 1 else ''

        # Get or create Django user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name':  first_name,
                'last_name':   last_name,
                'is_verified': True,
                'is_active':   True,
            }
        )

        # Update name/photo if returning user and fields are empty
        if not created:
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save()

        # Generate Django JWT tokens
        refresh = RefreshToken.for_user(user)
        refresh['email']     = user.email
        refresh['full_name'] = user.full_name

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            },
            'created': created,
        }, status=status.HTTP_200_OK)
