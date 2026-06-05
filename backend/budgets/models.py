from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid


class Budget(models.Model):
    CATEGORIES = [
        ('food', 'Food & Dining'),
        ('transport', 'Transport'),
        ('shopping', 'Shopping'),
        ('bills', 'Bills & Utilities'),
        ('health', 'Health & Medical'),
        ('education', 'Education'),
        ('entertainment', 'Entertainment'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=50, choices=CATEGORIES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2100)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets'
        unique_together = ['user', 'category', 'month', 'year']
        ordering = ['-year', '-month', 'category']

    def __str__(self):
        return f"{self.user.email} - {self.category} - {self.month}/{self.year}"

    @property
    def spent(self):
        from transactions.models import Expense
        total = Expense.objects.filter(
            user=self.user,
            category=self.category,
            date__month=self.month,
            date__year=self.year
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return float(total)

    @property
    def remaining(self):
        return float(self.amount) - self.spent

    @property
    def percentage_used(self):
        if float(self.amount) == 0:
            return 0
        return min(round((self.spent / float(self.amount)) * 100, 1), 100)

    @property
    def is_exceeded(self):
        return self.spent > float(self.amount)
