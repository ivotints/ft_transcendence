# Generated by Django 5.1.2 on 2024-11-11 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0020_alter_usertwofactorauthdata_mobile_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='friend',
            name='is_activated',
            field=models.BooleanField(default=False),
        ),
    ]
