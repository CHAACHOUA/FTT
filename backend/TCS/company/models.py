
from django.db import models
from forums.models import Forum



class Company(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True, help_text="Description de l'entreprise")
    sectors = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return self.name



class ForumCompany(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='forum_participations')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='company_participants')
    date_registered = models.DateTimeField(auto_now_add=True)
    stand = models.CharField(max_length=5, blank=True, null=True)
    approved = models.BooleanField(default=False, help_text="Indique si la participation de l'entreprise à ce forum est approuvée")

    class Meta:
        unique_together = ('company', 'forum')  # Pour éviter les doublons

    def __str__(self):
        return f"{self.company.name} @ {self.forum.name}"


