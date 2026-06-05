from django.db import migrations, models
import django.core.validators
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('budgets', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='amount',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))]
            ),
        ),
        migrations.AlterField(
            model_name='budget',
            name='month',
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(12),
                ]
            ),
        ),
        migrations.AlterField(
            model_name='budget',
            name='year',
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(2000),
                    django.core.validators.MaxValueValidator(2100),
                ]
            ),
        ),
    ]
