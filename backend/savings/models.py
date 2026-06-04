from django.db import models
from django.conf import settings
import uuid


class SavingsGoal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_date = models.DateField(null=True, blank=True)
    icon = models.CharField(max_length=50, default='🎯')
    color = models.CharField(max_length=20, default='#6366F1')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'savings_goals'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    @property
    def progress_percentage(self):
        if float(self.target_amount) == 0:
            return 0
        return min(round((float(self.current_amount) / float(self.target_amount)) * 100, 1), 100)

    @property
    def remaining_amount(self):
        return max(float(self.target_amount) - float(self.current_amount), 0)
