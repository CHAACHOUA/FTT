# Generated by Django 5.1 on 2025-05-10 19:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0002_alter_education_end_year_alter_education_start_year'),
    ]

    operations = [
        migrations.AddField(
            model_name='candidate',
            name='title',
            field=models.CharField(choices=[('Madame', 'Madame'), ('Monsieur', 'Monsieur'), ('Autre', 'Autre')], default=1, max_length=20),
            preserve_default=False,
        ),
    ]
