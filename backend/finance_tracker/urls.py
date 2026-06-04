from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/budgets/', include('budgets.urls')),
    path('api/savings/', include('savings.urls')),
    path('api/ai/', include('ai_module.urls')),
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
