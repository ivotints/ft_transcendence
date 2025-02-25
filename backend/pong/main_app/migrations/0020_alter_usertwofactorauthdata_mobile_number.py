# Generated by Django 5.1.2 on 2024-11-08 11:03

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0019_cowboymatchhistory'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usertwofactorauthdata',
            name='mobile_number',
            field=models.CharField(blank=True, max_length=15, null=True, validators=[django.core.validators.RegexValidator(message="Mobile number must be entered in the format: '+999999999'. Up to 15 digits allowed.", regex='^\\+[1-9]\\d{1,14}$')]),
        ),
    ]
