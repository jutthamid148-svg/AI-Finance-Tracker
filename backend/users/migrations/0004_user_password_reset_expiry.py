from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_avatar_textfield'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='password_reset_created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
