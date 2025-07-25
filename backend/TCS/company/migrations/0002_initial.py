# Generated by Django 5.1 on 2025-05-26 10:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('company', '0001_initial'),
        ('forums', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumcompany',
            name='forum',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='company_participants', to='forums.forum'),
        ),
        migrations.AlterUniqueTogether(
            name='forumcompany',
            unique_together={('company', 'forum')},
        ),
    ]
