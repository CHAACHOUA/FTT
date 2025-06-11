
from django.db import models
from forums.models import Forum


class Sector(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Company(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True)
    sectors = models.ManyToManyField(Sector, related_name='companies', blank=True)

    def __str__(self):
        return self.name



class ForumCompany(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='forum_participations')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='company_participants')
    date_registered = models.DateTimeField(auto_now_add=True)
    stand = models.CharField(max_length=5, blank=True, null=True)

    class Meta:
        unique_together = ('company', 'forum')  # Pour éviter les doublons

    def __str__(self):
        return f"{self.company.name} @ {self.forum.name}"


