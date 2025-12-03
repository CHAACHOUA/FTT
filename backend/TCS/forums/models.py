from django.db import models
from candidates.models import Candidate
from organizers.models import Organizer
from TCS.constants import FORUM_TYPE_CHOICES


# Create your models here.
class Forum(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=FORUM_TYPE_CHOICES)
    photo = models.ImageField(upload_to='forum_photos/')
    description = models.TextField(blank=True)
    start_date = models.DateField(default='2025-07-22')
    end_date = models.DateField(default='2025-07-22')
    start_time = models.TimeField(default='09:00')
    end_time = models.TimeField(default='17:00')
    created_at = models.DateTimeField(auto_now_add=True)
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE, related_name='forums')
    
    # Attributs pour les forums virtuels - Phases temporelles
    preparation_start = models.DateTimeField(null=True, blank=True, help_text="Début de la phase de préparation")
    preparation_end = models.DateTimeField(null=True, blank=True, help_text="Fin de la phase de préparation")
    jobdating_start = models.DateTimeField(null=True, blank=True, help_text="Début de la phase jobdating/traitement")
    interview_start = models.DateTimeField(null=True, blank=True, help_text="Début de la phase des entretiens")
    interview_end = models.DateTimeField(null=True, blank=True, help_text="Fin de la phase des entretiens") 

    def __str__(self):
        return self.name
    
    def is_virtual_forum(self):
        """Vérifie si le forum est de type virtuel"""
        return self.type == 'virtuel'
    
    def get_current_phase(self):
        """Retourne la phase actuelle du forum virtuel"""
        from django.utils import timezone
        now = timezone.now()
        
        if not self.is_virtual_forum():
            return None
            
        if self.preparation_start and now < self.preparation_start:
            return 'before_preparation'
        elif self.preparation_start and self.preparation_end and self.preparation_start <= now <= self.preparation_end:
            return 'preparation'
        elif self.preparation_end and self.jobdating_start and self.preparation_end < now < self.jobdating_start:
            return 'between_preparation_jobdating'
        elif self.jobdating_start and self.interview_start and self.jobdating_start <= now < self.interview_start:
            return 'jobdating'
        elif self.interview_start and self.interview_end and self.interview_start <= now <= self.interview_end:
            return 'interview'
        elif self.interview_end and now > self.interview_end:
            return 'completed'
        else:
            return 'unknown'
    
    def get_phase_display(self):
        """Retourne l'affichage de la phase actuelle"""
        phase = self.get_current_phase()
        phase_display = {
            'before_preparation': 'Avant préparation',
            'preparation': 'Phase de préparation',
            'between_preparation_jobdating': 'Transition',
            'jobdating': 'Phase jobdating/traitement',
            'interview': 'Phase entretiens',
            'completed': 'Terminé',
            'unknown': 'Phase inconnue'
        }
        return phase_display.get(phase, 'Phase inconnue')


class Speaker(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='speaker_photos/', blank=True, null=True)
    position = models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.position}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Programme(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='programmes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='programme_photos/', blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(default='09:00')
    end_time = models.TimeField(default='17:00')
    location = models.CharField(max_length=200)
    speakers = models.ManyToManyField(Speaker, blank=True, related_name='programmes')
    enable_zoom = models.BooleanField(default=False, help_text="Générer automatiquement un lien Zoom pour cette conférence")
    meeting_link = models.URLField(blank=True, null=True, help_text="Lien de la réunion Zoom")
    
    class Meta:
        ordering = ['start_date', 'start_time']
    
    def __str__(self):
        return f"{self.title} - {self.forum.name}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Vérifier que les dates du programme sont dans la plage du forum
        if self.start_date < self.forum.start_date or self.end_date > self.forum.end_date:
            raise ValidationError("Les dates du programme doivent être dans la plage de dates du forum")
    
    def should_show_zoom_link_to_candidate(self, user=None):
        """
        Vérifie si le lien Zoom doit être visible pour un candidat
        Le lien est visible seulement si :
        1. Le candidat est inscrit au programme
        2. 10 minutes avant le début de la conférence
        """
        from django.utils import timezone
        from datetime import timedelta
        
        if not self.meeting_link:
            return False
        
        # Vérifier si le candidat est inscrit
        if user and hasattr(user, 'candidate_profile'):
            is_registered = ProgrammeRegistration.objects.filter(
                programme=self,
                candidate=user.candidate_profile
            ).exists()
            if not is_registered:
                return False
        
        # Combiner date et heure de début
        start_datetime = timezone.make_aware(
            timezone.datetime.combine(self.start_date, self.start_time)
        )
        
        # 10 minutes avant
        ten_minutes_before = start_datetime - timedelta(minutes=10)
        now = timezone.now()
        
        return now >= ten_minutes_before
    
    def get_participants_count(self):
        """Retourne le nombre de participants inscrits"""
        return ProgrammeRegistration.objects.filter(programme=self).count()
    
    def is_candidate_registered(self, user):
        """Vérifie si un candidat est inscrit au programme"""
        if not user or not hasattr(user, 'candidate_profile'):
            return False
        return ProgrammeRegistration.objects.filter(
            programme=self,
            candidate=user.candidate_profile
        ).exists()


class ProgrammeRegistration(models.Model):
    """Modèle pour les inscriptions aux programmes"""
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='registrations')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='programme_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('programme', 'candidate')
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.candidate} inscrit à {self.programme.title}"


class ForumRegistration(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='registrations')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    search = models.OneToOneField(
        'CandidateSearch',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='registration_reverse'
    )

    class Meta:
        unique_together = ('forum', 'candidate')

    def __str__(self):
        return f"{self.candidate} inscrit à {self.forum}"

class CandidateSearch(models.Model):
    contract_type = models.JSONField(default=list)
    sector = models.JSONField(default=list)
    experience = models.PositiveIntegerField(null=True, blank=True)
    region = models.CharField(max_length=100)
    rqth = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.contract_type}, {self.region}"