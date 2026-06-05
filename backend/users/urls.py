from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/mark-read/', views.MarkNotificationReadView.as_view(), name='mark_all_read'),
    path('notifications/<uuid:pk>/mark-read/', views.MarkNotificationReadView.as_view(), name='mark_read'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),

    path('google/', views.GoogleAuthView.as_view(), name='google_auth'),

    # Admin endpoints (staff only)
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<uuid:user_id>/toggle-active/', views.AdminToggleUserActiveView.as_view(), name='admin_toggle_active'),
    path('admin/users/<uuid:user_id>/verify/', views.AdminVerifyUserView.as_view(), name='admin_verify_user'),
    path('admin/users/<uuid:user_id>/toggle-pro/', views.AdminToggleProView.as_view(), name='admin_toggle_pro'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin_stats'),
]
