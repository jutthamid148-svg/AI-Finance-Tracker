"""
Management command: python manage.py send_budget_alerts
Sends email alerts to users whose budgets are >= 80% used.
Run daily via a cron job or Render Cron Service.
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from budgets.models import Budget


class Command(BaseCommand):
    help = 'Send budget alert emails to users who are near or over their budget limits'

    def handle(self, *args, **options):
        now = timezone.now()
        month, year = now.month, now.year

        budgets = Budget.objects.filter(month=month, year=year).select_related('user')
        sent = 0
        errors = 0

        for budget in budgets:
            pct = budget.percentage_used
            if pct < 80:
                continue

            user = budget.user
            if not user.email:
                continue

            status = 'EXCEEDED 🚨' if budget.is_exceeded else f'{pct:.0f}% used ⚠️'
            remaining = max(budget.remaining, 0)
            cat_label = budget.get_category_display()

            subject = f'Budget Alert: {cat_label} is {status}'
            body = f"""Hi {user.first_name or user.email},

Your {cat_label} budget for {now.strftime('%B %Y')} needs attention:

  Budget set:   Rs. {float(budget.amount):,.0f}
  Spent so far: Rs. {budget.spent:,.0f}
  Remaining:    Rs. {remaining:,.0f}
  Status:       {status}

{"⚠️ You are close to your limit. Consider reducing spending in this category." if not budget.is_exceeded else "🚨 You have exceeded your budget! Try to limit further spending this month."}

💡 Tip: Use the AI Insights page to get personalized saving suggestions.

View your dashboard: {settings.FRONTEND_URL}/dashboard

— AI Finance Tracker Team
"""
            try:
                send_mail(
                    subject,
                    body,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                sent += 1
                self.stdout.write(self.style.SUCCESS(f'  Sent alert to {user.email} — {cat_label} {status}'))
            except Exception as e:
                errors += 1
                self.stderr.write(f'  Failed for {user.email}: {e}')

        self.stdout.write(self.style.SUCCESS(f'\nDone. Sent: {sent}, Errors: {errors}'))
