# Generated by Django 5.1 on 2025-05-15 10:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forums', '0001_initial'),
        ('organizers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forum',
            name='organizer',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='forums', to='organizers.organizer'),
            preserve_default=False,
        ),
    ]
