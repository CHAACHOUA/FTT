# Generated by Django 5.1 on 2025-05-11 22:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_remove_usertoken_new_email_alter_usertoken_token_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='usertoken',
            name='new_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]
