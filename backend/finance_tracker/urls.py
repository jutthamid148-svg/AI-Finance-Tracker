from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': timezone.now().isoformat(),
        'service': 'AI Finance Tracker API',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/', include('users.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/budgets/', include('budgets.urls')),
    path('api/savings/', include('savings.urls')),
    path('api/ai/', include('ai_module.urls')),
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
