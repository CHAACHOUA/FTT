from django.db import models
from django.contrib.auth import get_user_model
from forums.models import Forum
from recruiters.models import Offer

User = get_user_model()

class VirtualAgendaSlot(models.Model):
    """
    Modèle pour les créneaux d'agenda virtuel
    """
    TYPE_CHOICES = [
        ('video', 'Visioconférence'),
        ('phone', 'Téléphone'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('booked', 'Réservé'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]

    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='virtual_slots')
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='virtual_slots')
    date = models.DateField(help_text="Date du créneau")
    start_time = models.TimeField(help_text="Heure de début")
    end_time = models.TimeField(help_text="Heure de fin")
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='video', help_text="Type d'entretien")
    duration = models.PositiveIntegerField(default=30, help_text="Durée en minutes")
    description = models.TextField(blank=True, null=True, help_text="Description du créneau")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    candidate = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                related_name='booked_slots', help_text="Candidat qui a réservé")
    meeting_link = models.URLField(blank=True, null=True, help_text="Lien de la visioconférence")
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Numéro de téléphone")
    notes = models.TextField(blank=True, null=True, help_text="Notes de l'entretien")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['recruiter', 'date', 'start_time', 'end_time']

    def __str__(self):
        if hasattr(self.recruiter, 'recruiter_profile'):
            recruiter_profile = self.recruiter.recruiter_profile
            full_name = f"{recruiter_profile.first_name} {recruiter_profile.last_name}".strip()
            if not full_name:
                full_name = self.recruiter.email
        else:
            full_name = self.recruiter.email
        return f"{full_name} - {self.date} {self.start_time}-{self.end_time}"

    @property
    def is_available(self):
        return self.status == 'available'

    @property
    def is_booked(self):
        return self.status == 'booked'

    @property
    def is_completed(self):
        return self.status == 'completed'

    @property
    def is_cancelled(self):
        return self.status == 'cancelled'

    def can_be_modified(self):
        """Vérifie si le créneau peut être modifié"""
        return self.status in ['available', 'booked']

    def can_be_deleted(self):
        """Vérifie si le créneau peut être supprimé"""
        return self.status in ['available', 'booked']

    def get_duration_display(self):
        """Retourne la durée formatée"""
        hours = self.duration // 60
        minutes = self.duration % 60
        if hours > 0:
            return f"{hours}h{minutes:02d}min" if minutes > 0 else f"{hours}h"
        return f"{minutes}min"

    def get_type_display_icon(self):
        """Retourne l'icône correspondant au type"""
        return "📹" if self.type == 'video' else "📞"


class Questionnaire(models.Model):
    """
    Modèle pour les questionnaires personnalisés des offres
    """
    offer = models.OneToOneField(Offer, on_delete=models.CASCADE, related_name='questionnaire')
    title = models.CharField(max_length=200, help_text="Titre du questionnaire")
    description = models.TextField(blank=True, null=True, help_text="Description du questionnaire")
    is_active = models.BooleanField(default=True, help_text="Questionnaire actif")
    is_required = models.BooleanField(default=True, help_text="Questionnaire obligatoire")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Questionnaire pour {self.offer.title}"

    @property
    def questions_count(self):
        """Retourne le nombre de questions"""
        return self.questions.count()

    def get_questions_by_order(self):
        """Retourne les questions triées par ordre"""
        return self.questions.all().order_by('order')


class Question(models.Model):
    """
    Modèle pour les questions du questionnaire
    """
    QUESTION_TYPES = [
        ('text', 'Texte libre'),
        ('textarea', 'Texte long'),
        ('select', 'Liste déroulante'),
        ('radio', 'Choix unique'),
        ('checkbox', 'Choix multiples'),
        ('number', 'Nombre'),
        ('email', 'Email'),
        ('phone', 'Téléphone'),
        ('date', 'Date'),
        ('file', 'Fichier'),
    ]

    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField(help_text="Texte de la question")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, help_text="Type de question")
    is_required = models.BooleanField(default=True, help_text="Question obligatoire")
    order = models.PositiveIntegerField(default=0, help_text="Ordre d'affichage")
    
    # Options pour les questions à choix multiples
    options = models.JSONField(blank=True, null=True, help_text="Options pour les questions à choix")
    
    # Validation
    min_length = models.PositiveIntegerField(blank=True, null=True, help_text="Longueur minimale")
    max_length = models.PositiveIntegerField(blank=True, null=True, help_text="Longueur maximale")
    min_value = models.FloatField(blank=True, null=True, help_text="Valeur minimale")
    max_value = models.FloatField(blank=True, null=True, help_text="Valeur maximale")
    
    # Fichiers
    allowed_file_types = models.JSONField(blank=True, null=True, help_text="Types de fichiers autorisés")
    max_file_size = models.PositiveIntegerField(blank=True, null=True, help_text="Taille maximale en MB")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.question_text[:50]}..." if len(self.question_text) > 50 else self.question_text

    @property
    def is_choice_question(self):
        """Vérifie si c'est une question à choix multiples"""
        return self.question_type in ['select', 'radio', 'checkbox']

    @property
    def is_text_question(self):
        """Vérifie si c'est une question de type texte"""
        return self.question_type in ['text', 'textarea', 'email', 'phone']

    @property
    def is_numeric_question(self):
        """Vérifie si c'est une question numérique"""
        return self.question_type == 'number'

    @property
    def is_file_question(self):
        """Vérifie si c'est une question de fichier"""
        return self.question_type == 'file'

    def get_options_display(self):
        """Retourne les options formatées"""
        if self.options:
            return [option.get('label', option.get('value', str(option))) for option in self.options]
        return []

    def validate_answer(self, answer):
        """Valide une réponse selon les règles de la question"""
        if self.is_required and not answer:
            return False, "Cette question est obligatoire"
        
        if not answer:
            return True, None
        
        # Validation selon le type
        if self.is_text_question:
            if self.min_length and len(str(answer)) < self.min_length:
                return False, f"Minimum {self.min_length} caractères requis"
            if self.max_length and len(str(answer)) > self.max_length:
                return False, f"Maximum {self.max_length} caractères autorisés"
        
        elif self.is_numeric_question:
            try:
                value = float(answer)
                if self.min_value is not None and value < self.min_value:
                    return False, f"Valeur minimale: {self.min_value}"
                if self.max_value is not None and value > self.max_value:
                    return False, f"Valeur maximale: {self.max_value}"
            except (ValueError, TypeError):
                return False, "Valeur numérique requise"
        
        return True, None


class QuestionnaireResponse(models.Model):
    """
    Modèle pour les réponses aux questionnaires
    """
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='responses')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questionnaire_responses')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='questionnaire_responses')
    
    is_completed = models.BooleanField(default=False, help_text="Questionnaire complété")
    submitted_at = models.DateTimeField(blank=True, null=True, help_text="Date de soumission")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['questionnaire', 'candidate']
        ordering = ['-created_at']

    def __str__(self):
        return f"Réponse de {self.candidate.email} pour {self.questionnaire.title}"

    @property
    def completion_percentage(self):
        """Calcule le pourcentage de completion"""
        total_questions = self.questionnaire.questions.count()
        if total_questions == 0:
            return 100
        
        answered_questions = self.answers.count()
        return (answered_questions / total_questions) * 100


class QuestionAnswer(models.Model):
    """
    Modèle pour les réponses individuelles aux questions
    """
    response = models.ForeignKey(QuestionnaireResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField(blank=True, null=True, help_text="Réponse textuelle")
    answer_number = models.FloatField(blank=True, null=True, help_text="Réponse numérique")
    answer_choices = models.JSONField(blank=True, null=True, help_text="Choix sélectionnés")
    answer_file = models.FileField(upload_to='questionnaire_files/', blank=True, null=True, help_text="Fichier uploadé")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['response', 'question']
        ordering = ['question__order']

    def __str__(self):
        return f"Réponse à: {self.question.question_text[:30]}..."

    @property
    def answer_display(self):
        """Retourne la réponse formatée pour l'affichage"""
        if self.answer_text:
            return self.answer_text
        elif self.answer_number is not None:
            return str(self.answer_number)
        elif self.answer_choices:
            return ', '.join(self.answer_choices)
        elif self.answer_file:
            return self.answer_file.name
        return "Aucune réponse"

    def is_valid(self):
        """Valide la réponse selon les règles de la question"""
        return self.question.validate_answer(self.answer_display)


class VirtualApplication(models.Model):
    """
    Modèle pour les candidatures dans les forums virtuels
    """
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('reviewed', 'Consultée'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
        ('cancelled', 'Annulée'),
    ]

    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='virtual_applications')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='virtual_applications')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='virtual_applications')
    selected_slot = models.ForeignKey(VirtualAgendaSlot, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='applications')
    questionnaire_responses = models.JSONField(blank=True, null=True, help_text="Réponses au questionnaire")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True, help_text="Notes du recruteur")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['candidate', 'offer']

    def __str__(self):
        return f"Candidature de {self.candidate.email} pour {self.offer.title}"

    @property
    def candidate_name(self):
        """Retourne le nom complet du candidat"""
        if hasattr(self.candidate, 'candidate_profile'):
            profile = self.candidate.candidate_profile
            return f"{profile.first_name} {profile.last_name}".strip()
        return self.candidate.email

    @property
    def recruiter_name(self):
        """Retourne le nom du recruteur"""
        if hasattr(self.offer.recruiter, 'recruiter_profile'):
            profile = self.offer.recruiter.recruiter_profile
            return f"{profile.first_name} {profile.last_name}".strip()
        return self.offer.recruiter.user.email if hasattr(self.offer.recruiter, 'user') else "Recruteur inconnu"