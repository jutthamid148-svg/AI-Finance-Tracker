from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import threading


def _send_budget_email(user, budget, pct):
    """Send budget alert email in background thread — never blocks the request."""
    try:
        cat_label = budget.get_category_display()
        status = 'EXCEEDED 🚨' if budget.is_exceeded else f'{pct:.0f}% used ⚠️'
        remaining = max(budget.remaining, 0)
        from django.utils import timezone
        month_name = timezone.now().strftime('%B %Y')

        subject = f'Budget Alert: {cat_label} is {status}'
        body = f"""Hi {user.first_name or user.email},

Your {cat_label} budget for {month_name} needs attention:

  Budget set:   Rs. {float(budget.amount):,.0f}
  Spent so far: Rs. {budget.spent:,.0f}
  Remaining:    Rs. {remaining:,.0f}
  Status:       {status}

{"⚠️ You are near your budget limit. Try to reduce spending in this category." if not budget.is_exceeded else "🚨 Budget exceeded! Consider reviewing your expenses for this month."}

💡 Open AI Insights for personalised saving tips.

View dashboard: {settings.FRONTEND_URL}/dashboard

— AI Finance Tracker
"""
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
    except Exception:
        pass


@receiver(post_save, sender='transactions.Expense')
def check_budget_on_expense(sender, instance, created, **kwargs):
    if not created:
        return
    if not instance.user.email:
        return

    try:
        from budgets.models import Budget
        budget = Budget.objects.filter(
            user=instance.user,
            category=instance.category,
            month=instance.date.month,
            year=instance.date.year,
        ).first()

        if not budget:
            return

        pct = budget.percentage_used
        if pct >= 80:
            t = threading.Thread(target=_send_budget_email, args=(instance.user, budget, pct), daemon=True)
            t.start()
    except Exception:
        pass
