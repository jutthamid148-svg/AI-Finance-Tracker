from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_pro',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='pro_since',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
