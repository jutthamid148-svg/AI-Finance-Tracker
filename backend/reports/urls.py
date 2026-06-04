from django.urls import path
from . import views

urlpatterns = [
    path('monthly/', views.MonthlyReportView.as_view(), name='monthly_report'),
    path('export/pdf/', views.ExportPDFView.as_view(), name='export_pdf'),
    path('export/excel/', views.ExportExcelView.as_view(), name='export_excel'),
]
