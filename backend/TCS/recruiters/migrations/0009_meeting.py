# Generated by Django 5.1 on 2025-06-27 08:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0003_candidate_public_token'),
        ('company', '0006_remove_company_sectors_delete_sector_company_sectors'),
        ('forums', '0006_alter_candidatesearch_contract_type_and_more'),
        ('recruiters', '0008_rename_photo_recruiter_profile_picture'),
    ]

    operations = [
        migrations.CreateModel(
            name='Meeting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scanned_at', models.DateTimeField(auto_now_add=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetings', to='candidates.candidate')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetings', to='company.company')),
                ('forum', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetings', to='forums.forum')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetings', to='recruiters.recruiter')),
            ],
            options={
                'unique_together': {('candidate', 'recruiter', 'forum')},
            },
        ),
    ]
