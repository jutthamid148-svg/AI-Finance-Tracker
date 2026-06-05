from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


EXPENSE_CATEGORIES = [
    ('food', 'Food & Dining'),
    ('transport', 'Transport'),
    ('shopping', 'Shopping'),
    ('bills', 'Bills & Utilities'),
    ('health', 'Health & Medical'),
    ('education', 'Education'),
    ('entertainment', 'Entertainment'),
    ('other', 'Other'),
]

INCOME_SOURCES = [
    ('salary', 'Salary'),
    ('freelance', 'Freelance'),
    ('business', 'Business'),
    ('investment', 'Investment'),
    ('gift', 'Gift'),
    ('other', 'Other'),
]


class Income(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incomes')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    source = models.CharField(max_length=50, choices=INCOME_SOURCES)
    description = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'income'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.source} - {self.amount}"


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    category = models.CharField(max_length=50, choices=EXPENSE_CATEGORIES)
    description = models.TextField(blank=True)
    date = models.DateField()
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.category} - {self.amount}"
