from django.db import models
from django.contrib.auth import get_user_model
from forums.models import Forum
from company.models import Company

User = get_user_model()


class Conversation(models.Model):
    """Modèle pour les conversations entre entreprises et candidats (partagées entre recruteurs)"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
    ]
    
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='conversations')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='conversations')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='candidate_conversations')
    # Garder recruiter pour la compatibilité (le recruteur qui a initié ou accepté)
    recruiter = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='recruiter_conversations', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [('forum', 'company', 'candidate')]
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation {self.company.name} - {self.candidate.email} ({self.forum.name})"
    
    def can_candidate_send_message(self):
        """Vérifie si le candidat peut envoyer un message"""
        return self.status == 'accepted'
    
    def can_recruiter_send_message(self, user):
        """Vérifie si un recruteur de l'entreprise peut envoyer un message"""
        if not hasattr(user, 'recruiter_profile'):
            return False
        return user.recruiter_profile.company == self.company


class Message(models.Model):
    """Modèle pour les messages dans une conversation"""
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.email} in conversation {self.conversation.id}"
    
    def mark_as_read(self):
        """Marque le message comme lu"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
