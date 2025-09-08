import uuid
from django.db import models
from users.models import User



class Candidate(models.Model):
    TITLE_CHOICES = [
        ('Madame', 'Madame'),
        ('Monsieur', 'Monsieur'),
        ('Autre', 'Autre'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='candidate_profile')
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    title = models.CharField(max_length=20, choices=TITLE_CHOICES,blank=True)
    phone = models.CharField(max_length=20, blank=True)
    linkedin = models.URLField(blank=True)
    education_level = models.CharField(max_length=255, blank=True)
    preferred_contract_type = models.CharField(max_length=255, blank=True)
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)
    bio = models.TextField(blank=True, help_text="Biographie du candidat")
    created_at = models.DateTimeField(auto_now_add=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"Candidate: {self.first_name} {self.last_name}"



class Experience(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='experiences')
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    def __str__(self):
        return f"{self.job_title} at {self.company}"



class Education(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='educations')
    degree = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    

    
    def __str__(self):
        return f"{self.degree} - {self.institution}"



class Skill(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name



class Language(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name



class CandidateLanguage(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='candidate_languages')
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    level = models.CharField(max_length=255)  # ex: Beginner, Intermediate, Advanced, Fluent

    class Meta:
        unique_together = ('candidate', 'language')

    def __str__(self):
        return f"{self.candidate.first_name} speaks {self.language.name} ({self.level})"


class CandidateForumProgress(models.Model):
    """Modèle pour stocker la progression de gamification d'un candidat dans un forum"""
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='forum_progress')
    forum = models.ForeignKey('forums.Forum', on_delete=models.CASCADE)
    visited_companies = models.JSONField(default=list, help_text="Liste des IDs des entreprises visitées")
    company_notes = models.JSONField(default=dict, help_text="Notes par entreprise {company_id: note}")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['candidate', 'forum']
        verbose_name = "Progression Forum Candidat"
        verbose_name_plural = "Progressions Forum Candidats"

    def __str__(self):
        return f"{self.candidate} - {self.forum.name}"

    @property
    def progress_percentage(self):
        """Calcule le pourcentage de progression"""
        if not self.visited_companies:
            return 0
        # Ici on devrait récupérer le nombre total d'entreprises du forum
        # Pour l'instant on retourne 0, on l'ajustera dans l'API
        return 0

