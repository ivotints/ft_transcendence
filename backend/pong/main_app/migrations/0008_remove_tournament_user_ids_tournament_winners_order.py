# Generated by Django 5.1.1 on 2024-09-23 16:13

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0007_tournament_tournament_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='user_ids',
        ),
        migrations.AddField(
            model_name='tournament',
            name='winners_order',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), blank=True, default=list, size=None),
        ),
    ]
