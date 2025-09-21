# recruiter/models.py
from django.db import models
from users.models import User
from company.models import Company
from candidates.models import Candidate
from forums.models import Forum
from TCS.constants import SECTOR_CHOICES, CONTRACT_CHOICES


class Recruiter(models.Model):
    TITLE_CHOICES = [
        ('Madame', 'Madame'),
        ('Monsieur', 'Monsieur'),
        ('Autre', 'Autre'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='recruiters')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='recruiter_photos/', blank=True, null=True)  # 📸 Photo ajoutée
    title = models.CharField(max_length=20, choices=TITLE_CHOICES,blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company.name}"
class RecruiterForumParticipation(models.Model):
    recruiter = models.ForeignKey('Recruiter', on_delete=models.CASCADE, related_name='forum_participations')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='recruiter_participations')
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recruiter', 'forum')

    def __str__(self):
        return f"{self.recruiter} in {self.forum}"

class Offer(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publiée'),
        ('expired', 'Expirée'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('0-1', '0-1 an'),
        ('1-3', '1-3 ans'),
        ('3-5', '3-5 ans'),
        ('5+', '5+ ans'),
    ]

    recruiter = models.ForeignKey(Recruiter, on_delete=models.CASCADE, related_name='offers')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='offers')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='offers')

    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    sector = models.CharField(max_length=100, choices=SECTOR_CHOICES)
    contract_type = models.CharField(max_length=50, choices=CONTRACT_CHOICES)
    profile_recherche = models.TextField(blank=True, help_text="Profil recherché pour ce poste")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateField(help_text="Date de début du poste", default='2024-01-01')
    experience_required = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES, help_text="Années d'expérience requises", default='1-3')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} @ {self.company.name}"
class FavoriteOffer(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='favorite_offers')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'offer')
        verbose_name = "Offre Favorite"
        verbose_name_plural = "Offres Favorites"

    def __str__(self):
        return f"{self.candidate.user.email} ❤️ {self.offer.title}"

# models.py
class Meeting(models.Model):
    candidate = models.ForeignKey('candidates.Candidate', on_delete=models.CASCADE, related_name='meetings')
    recruiter = models.ForeignKey('recruiters.Recruiter', on_delete=models.CASCADE, related_name='meetings')
    forum = models.ForeignKey('forums.Forum', on_delete=models.CASCADE, related_name='meetings')
    company = models.ForeignKey('company.Company', on_delete=models.CASCADE, related_name='meetings')
    scanned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'recruiter', 'forum')

    def __str__(self):
        return f"Meeting: {self.recruiter} met {self.candidate} at {self.forum.name}"
