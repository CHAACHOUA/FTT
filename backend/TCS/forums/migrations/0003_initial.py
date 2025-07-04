# Generated by Django 5.1 on 2025-05-26 10:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('candidates', '0001_initial'),
        ('forums', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumregistration',
            name='candidate',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='candidates.candidate'),
        ),
        migrations.AddField(
            model_name='forumregistration',
            name='forum',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='registrations', to='forums.forum'),
        ),
        migrations.AlterUniqueTogether(
            name='forumregistration',
            unique_together={('forum', 'candidate')},
        ),
    ]
