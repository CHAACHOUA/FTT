from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Modèle pour les notifications utilisateur
    """
    TYPE_CHOICES = [
        # Candidat
        ('application_sent', 'Candidature envoyée'),
        ('application_accepted', 'Candidature acceptée'),
        ('application_rejected', 'Candidature rejetée'),
        ('application_viewed', 'Candidature consultée'),
        ('slot_booked', 'Créneau réservé'),
        ('slot_cancelled', 'Créneau annulé'),
        ('zoom_link_created', 'Lien Zoom créé'),
        ('interview_reminder_24h', 'Rappel entretien 24h'),
        ('interview_reminder_10min', 'Rappel entretien 10min'),
        ('interview_status_changed', 'Statut entretien changé'),
        ('interview_completed', 'Entretien terminé'),
        ('new_offer', 'Nouvelle offre disponible'),
        ('new_programme', 'Nouveau programme ajouté'),
        ('zoom_programme_available', 'Lien Zoom programme disponible'),
        ('forum_registered', 'Inscription forum confirmée'),
        ('chat_request', 'Demande de discussion'),
        ('chat_accepted', 'Demande de discussion acceptée'),
        ('chat_rejected', 'Demande de discussion refusée'),
        ('new_message', 'Nouveau message'),
        
        # Recruteur
        ('new_application', 'Nouvelle candidature reçue'),
        ('application_validated', 'Candidature validée'),
        ('application_rejected_by_recruiter', 'Candidature rejetée'),
        ('questionnaire_completed', 'Questionnaire complété'),
        ('slot_reserved', 'Créneau réservé par candidat'),
        ('slot_cancelled_by_candidate', 'Créneau annulé par candidat'),
        ('slot_created', 'Créneau créé'),
        ('slot_updated', 'Créneau modifié'),
        ('slot_deleted', 'Créneau supprimé'),
        ('offer_created', 'Offre créée'),
        ('offer_updated', 'Offre modifiée'),
        ('offer_deleted', 'Offre supprimée'),
        ('company_approved', 'Entreprise approuvée'),
        ('company_rejected', 'Entreprise refusée'),
        ('recruiter_invited', 'Invitation recruteur envoyée'),
        
        # Organisateur
        ('forum_created', 'Forum créé'),
        ('forum_updated', 'Forum modifié'),
        ('forum_deleted', 'Forum supprimé'),
        ('forum_phase_changed', 'Phase du forum changée'),
        ('programme_created', 'Programme créé'),
        ('programme_updated', 'Programme modifié'),
        ('programme_deleted', 'Programme supprimé'),
        ('zoom_programme_created', 'Lien Zoom programme créé'),
        ('speaker_added', 'Speaker ajouté'),
        ('company_added', 'Entreprise ajoutée'),
        ('company_approval_request', 'Demande approbation entreprise'),
        ('recruiter_registration_request', 'Demande inscription recruteur'),
        ('new_application_forum', 'Nouvelle candidature sur le forum'),
        ('new_offer_forum', 'Nouvelle offre créée'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'Haute'),
        ('medium', 'Moyenne'),
        ('low', 'Basse'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    related_object_type = models.CharField(max_length=50, blank=True, null=True, help_text="Type d'objet lié (application, slot, offer, etc.)")
    related_object_id = models.IntegerField(blank=True, null=True, help_text="ID de l'objet lié")
    action_url = models.URLField(blank=True, null=True, help_text="URL vers l'action associée")
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    @property
    def is_old(self):
        """Vérifie si la notification a plus de 30 jours"""
        return (timezone.now() - self.created_at).days > 30

