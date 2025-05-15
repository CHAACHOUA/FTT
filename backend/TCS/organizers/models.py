from django.db import models

from users.models import User


# Create your models here.
class Organizer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='organizer_profile')
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to='organizer_logos/', blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"