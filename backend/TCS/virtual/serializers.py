from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import datetime
import logging
from .models import VirtualAgendaSlot, Questionnaire, Question, QuestionnaireResponse, QuestionAnswer, VirtualApplication
from forums.models import Forum
from recruiters.models import Offer
from .utils.timezone_utils import format_time_for_user, get_user_timezone

User = get_user_model()

# Configuration du logger
logger = logging.getLogger(__name__)

class VirtualAgendaSlotSerializer(serializers.ModelSerializer):
    """
    Serializer principal pour les créneaux d'agenda virtuel
    """
    recruiter_name = serializers.SerializerMethodField()
    recruiter_email = serializers.EmailField(source='recruiter.email', read_only=True)
    recruiter = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    duration_display = serializers.CharField(source='get_duration_display', read_only=True)
    type_icon = serializers.CharField(source='get_type_display_icon', read_only=True)
    can_be_modified = serializers.BooleanField(read_only=True)
    can_be_deleted = serializers.BooleanField(read_only=True)
    # Champs pour la gestion des fuseaux horaires
    start_time_display = serializers.SerializerMethodField()
    end_time_display = serializers.SerializerMethodField()
    timezone_info = serializers.SerializerMethodField()

    class Meta:
        model = VirtualAgendaSlot
        fields = [
            'id', 'forum', 'recruiter', 'date', 'start_time', 'end_time',
            'type', 'duration', 'description', 'status', 'candidate',
            'meeting_link', 'phone_number', 'notes', 'created_at', 'updated_at',
            'recruiter_name', 'recruiter_email', 'candidate_name', 'candidate_email',
            'duration_display', 'type_icon', 'can_be_modified', 'can_be_deleted',
            'start_time_display', 'end_time_display', 'timezone_info'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_recruiter_name(self, obj):
        """Retourne le nom complet du recruteur"""
        if obj.recruiter and hasattr(obj.recruiter, 'recruiter_profile'):
            recruiter_profile = obj.recruiter.recruiter_profile
            full_name = f"{recruiter_profile.first_name} {recruiter_profile.last_name}".strip()
            return full_name if full_name else obj.recruiter.email
        return obj.recruiter.email if obj.recruiter else ""

    def get_recruiter(self, obj):
        """Retourne les informations complètes du recruteur"""
        if obj.recruiter and hasattr(obj.recruiter, 'recruiter_profile'):
            recruiter_profile = obj.recruiter.recruiter_profile
            return {
                'id': obj.recruiter.id,
                'first_name': recruiter_profile.first_name,
                'last_name': recruiter_profile.last_name,
                'email': obj.recruiter.email,
                'full_name': f"{recruiter_profile.first_name} {recruiter_profile.last_name}".strip(),
                'company': {
                    'id': recruiter_profile.company.id,
                    'name': recruiter_profile.company.name
                } if recruiter_profile.company else None
            }
        elif obj.recruiter:
            return {
                'id': obj.recruiter.id,
                'first_name': '',
                'last_name': '',
                'email': obj.recruiter.email,
                'full_name': obj.recruiter.email,
                'company': None
            }
        return None

    def get_candidate_name(self, obj):
        """Retourne le nom complet du candidat"""
        if obj.candidate and hasattr(obj.candidate, 'candidate_profile'):
            candidate_profile = obj.candidate.candidate_profile
            full_name = f"{candidate_profile.first_name} {candidate_profile.last_name}".strip()
            return full_name if full_name else obj.candidate.email
        return obj.candidate.email if obj.candidate else ""

    def get_start_time_display(self, obj):
        """Retourne l'heure de début formatée pour l'utilisateur"""
        # Utiliser directement l'heure stockée sans conversion pour éviter les décalages
        return obj.start_time.strftime('%H:%M')

    def get_end_time_display(self, obj):
        """Retourne l'heure de fin formatée pour l'utilisateur"""
        # Utiliser directement l'heure stockée sans conversion pour éviter les décalages
        return obj.end_time.strftime('%H:%M')

    def get_timezone_info(self, obj):
        """Retourne les informations de fuseau horaire"""
        request = self.context.get('request')
        if request and request.user:
            user_tz = get_user_timezone(request.user)
            # Créer un datetime complet pour calculer l'offset
            dt = datetime.combine(obj.date, obj.start_time)
            # Localiser le datetime dans le fuseau horaire de l'utilisateur
            localized_dt = user_tz.localize(dt)
            return {
                'user_timezone': str(user_tz),
                'user_timezone_name': user_tz.zone,
                'offset': localized_dt.utcoffset().total_seconds() / 3600
            }
        return None

    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que l'heure de fin est après l'heure de début
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("L'heure de fin doit être après l'heure de début")
        
        # Calculer la durée réelle basée sur les heures
        start_minutes = data['start_time'].hour * 60 + data['start_time'].minute
        end_minutes = data['end_time'].hour * 60 + data['end_time'].minute
        actual_duration = end_minutes - start_minutes
        
        # Mettre à jour la durée pour qu'elle corresponde aux heures saisies
        data['duration'] = actual_duration
        
        return data

    def validate_date(self, value):
        """Validation de la date"""
        forum = self.context.get('forum')
        if forum:
            # Vérifier que la date est dans la période d'entretiens
            if forum.interview_start and value < forum.interview_start.date():
                raise serializers.ValidationError("La date doit être après le début de la période d'entretiens")
            if forum.interview_end and value > forum.interview_end.date():
                raise serializers.ValidationError("La date doit être avant la fin de la période d'entretiens")
        
        return value

class VirtualAgendaSlotCreateSerializer(serializers.Serializer):
    """
    Serializer pour la création de créneaux d'agenda virtuel
    """
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    type = serializers.ChoiceField(choices=[('video', 'Visioconférence'), ('phone', 'Téléphone')])
    duration = serializers.IntegerField()
    description = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=[('available', 'Disponible'), ('booked', 'Réservé'), ('completed', 'Terminé'), ('cancelled', 'Annulé')])
    recruiter = serializers.EmailField(required=False)  # CORRECTION: Utiliser EmailField au lieu d'IntegerField

    def validate_recruiter(self, value):
        """Validation du recruteur par email"""
        if value:
            try:
                user = User.objects.get(email=value)
                if hasattr(user, 'candidate_profile'):
                    raise serializers.ValidationError("Un candidat ne peut pas créer de créneaux d'agenda")
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("Recruteur avec cet email non trouvé")
        return value

    def create(self, validated_data):
        """Créer le créneau"""
        return VirtualAgendaSlot.objects.create(**validated_data)

class VirtualAgendaSlotUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour des créneaux
    """
    class Meta:
        model = VirtualAgendaSlot
        fields = [
            'date', 'start_time', 'end_time', 'type', 'duration', 
            'description', 'status', 'meeting_link', 'phone_number', 'notes'
        ]
        # Rendre les champs optionnels pour la mise à jour
        extra_kwargs = {
            'date': {'required': False},
            'start_time': {'required': False},
            'end_time': {'required': False},
            'type': {'required': False},
            'duration': {'required': False},
            'description': {'required': False},
            'status': {'required': False},
            'meeting_link': {'required': False},
            'phone_number': {'required': False},
            'notes': {'required': False}
        }

    def validate(self, data):
        """Validation personnalisée"""
        logger.info(f"🔍 VirtualAgendaSlotUpdateSerializer.validate called with data: {data}")
        
        if 'start_time' in data and 'end_time' in data:
            logger.info(f"🔍 Validating time range: {data['start_time']} - {data['end_time']}")
            
            if data['start_time'] >= data['end_time']:
                logger.error(f"❌ End time must be after start time")
                raise serializers.ValidationError("L'heure de fin doit être après l'heure de début")
            
            # Calculer la durée réelle basée sur les heures
            start_minutes = data['start_time'].hour * 60 + data['start_time'].minute
            end_minutes = data['end_time'].hour * 60 + data['end_time'].minute
            actual_duration = end_minutes - start_minutes

            logger.info(f"🔍 Calculated duration: {actual_duration} minutes")
            
            # Mettre à jour la durée pour qu'elle corresponde aux heures saisies
            data['duration'] = actual_duration
        
        logger.info(f"✅ Validation successful, returning data: {data}")
        return data

class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Serializer pour les membres de l'équipe
    """
    full_name = serializers.SerializerMethodField()
    is_current_user = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'full_name', 'is_current_user']

    def get_full_name(self, obj):
        """Retourne le nom complet"""
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username

    def get_is_current_user(self, obj):
        """Vérifie si c'est l'utilisateur actuel"""
        request = self.context.get('request')
        if request and request.user:
            return obj.id == request.user.id
        return False


# ===== SERIALIZERS POUR LES QUESTIONNAIRES =====

class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les questions du questionnaire
    """
    options_display = serializers.SerializerMethodField()
    is_choice_question = serializers.BooleanField(read_only=True)
    is_text_question = serializers.BooleanField(read_only=True)
    is_numeric_question = serializers.BooleanField(read_only=True)
    is_file_question = serializers.BooleanField(read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'is_required', 'order',
            'options', 'min_length', 'max_length', 'min_value', 'max_value',
            'allowed_file_types', 'max_file_size', 'created_at', 'updated_at',
            'options_display', 'is_choice_question', 'is_text_question',
            'is_numeric_question', 'is_file_question'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_options_display(self, obj):
        """Retourne les options formatées"""
        return obj.get_options_display()

    def validate_options(self, value):
        """Validation des options pour les questions à choix"""
        if value and not isinstance(value, list):
            raise serializers.ValidationError("Les options doivent être une liste")
        
        for option in value or []:
            if not isinstance(option, dict):
                raise serializers.ValidationError("Chaque option doit être un objet")
            if 'value' not in option:
                raise serializers.ValidationError("Chaque option doit avoir une valeur")
        
        return value

    def validate(self, data):
        """Validation personnalisée"""
        question_type = data.get('question_type')
        options = data.get('options')
        
        # Vérifier que les questions à choix ont des options
        if question_type in ['select', 'radio', 'checkbox'] and not options:
            raise serializers.ValidationError("Les questions à choix doivent avoir des options")
        
        # Vérifier que les questions non-choix n'ont pas d'options
        if question_type not in ['select', 'radio', 'checkbox'] and options:
            raise serializers.ValidationError("Les questions non-choix ne doivent pas avoir d'options")
        
        return data


class QuestionnaireSerializer(serializers.ModelSerializer):
    """
    Serializer pour les questionnaires
    """
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField(read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    offer_id = serializers.IntegerField(source='offer.id', read_only=True)

    class Meta:
        model = Questionnaire
        fields = [
            'id', 'offer', 'title', 'description', 'is_active', 'is_required',
            'created_at', 'updated_at', 'questions', 'questions_count',
            'offer_title', 'offer_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_offer(self, value):
        """Validation de l'offre"""
        # Vérifier que l'offre appartient à un forum virtuel
        if not hasattr(value, 'forum') or not value.forum:
            raise serializers.ValidationError("L'offre doit appartenir à un forum")
        
        if not (value.forum.type == 'virtuel' or value.forum.is_virtual):
            raise serializers.ValidationError("Le questionnaire n'est disponible que pour les forums virtuels")
        
        return value


class QuestionnaireCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création de questionnaires avec questions
    """
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Questionnaire
        fields = [
            'offer', 'title', 'description', 'is_active', 'is_required', 'questions'
        ]

    def create(self, validated_data):
        """Créer le questionnaire avec ses questions"""
        print(f"[SERIALIZER CREATE] Données validées: {validated_data}")
        questions_data = validated_data.pop('questions', [])
        print(f"[SERIALIZER CREATE] Questions data: {questions_data}")
        print(f"[SERIALIZER CREATE] Nombre de questions: {len(questions_data)}")
        
        questionnaire = Questionnaire.objects.create(**validated_data)
        print(f"[SERIALIZER CREATE] Questionnaire créé: {questionnaire.id}")
        
        # Créer les questions
        for i, question_data in enumerate(questions_data):
            print(f"[SERIALIZER CREATE] Création question {i+1}: {question_data}")
            question = Question.objects.create(questionnaire=questionnaire, **question_data)
            print(f"[SERIALIZER CREATE] Question {i+1} créée: {question.id}")
        
        print(f"[SERIALIZER CREATE] Questionnaire final avec {questionnaire.questions.count()} questions")
        return questionnaire

    def update(self, instance, validated_data):
        """Mettre à jour le questionnaire et ses questions"""
        print(f"[SERIALIZER UPDATE] Instance: {instance}")
        print(f"[SERIALIZER UPDATE] Données validées: {validated_data}")
        questions_data = validated_data.pop('questions', None)
        print(f"[SERIALIZER UPDATE] Questions data: {questions_data}")
        print(f"[SERIALIZER UPDATE] Nombre de questions: {len(questions_data) if questions_data else 'None'}")
        
        # Mettre à jour le questionnaire
        for attr, value in validated_data.items():
            print(f"[SERIALIZER UPDATE] Mise à jour {attr}: {value}")
            setattr(instance, attr, value)
        instance.save()
        print(f"[SERIALIZER UPDATE] Questionnaire mis à jour: {instance.id}")
        
        # Mettre à jour les questions si fournies
        if questions_data is not None:
            print(f"[SERIALIZER UPDATE] Suppression des anciennes questions...")
            old_count = instance.questions.count()
            instance.questions.all().delete()
            print(f"[SERIALIZER UPDATE] {old_count} anciennes questions supprimées")
            
            # Créer les nouvelles questions
            for i, question_data in enumerate(questions_data):
                print(f"[SERIALIZER UPDATE] Création question {i+1}: {question_data}")
                question = Question.objects.create(questionnaire=instance, **question_data)
                print(f"[SERIALIZER UPDATE] Question {i+1} créée: {question.id}")
        
        print(f"[SERIALIZER UPDATE] Questionnaire final avec {instance.questions.count()} questions")
        return instance


class QuestionAnswerSerializer(serializers.ModelSerializer):
    """
    Serializer pour les réponses aux questions
    """
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    is_required = serializers.BooleanField(source='question.is_required', read_only=True)
    answer_display = serializers.CharField(read_only=True)

    class Meta:
        model = QuestionAnswer
        fields = [
            'id', 'question', 'answer_text', 'answer_number', 'answer_choices',
            'answer_file', 'created_at', 'updated_at', 'question_text',
            'question_type', 'is_required', 'answer_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Validation personnalisée des réponses"""
        question = data.get('question')
        if not question:
            raise serializers.ValidationError("La question est requise")
        
        # Valider selon le type de question
        is_valid, error_message = question.validate_answer(self.get_answer_value(data))
        if not is_valid:
            raise serializers.ValidationError(error_message)
        
        return data

    def get_answer_value(self, data):
        """Retourne la valeur de la réponse pour validation"""
        if 'answer_text' in data and data['answer_text']:
            return data['answer_text']
        elif 'answer_number' in data and data['answer_number'] is not None:
            return data['answer_number']
        elif 'answer_choices' in data and data['answer_choices']:
            return data['answer_choices']
        elif 'answer_file' in data and data['answer_file']:
            return data['answer_file']
        return None


class QuestionnaireResponseSerializer(serializers.ModelSerializer):
    """
    Serializer pour les réponses aux questionnaires
    """
    answers = QuestionAnswerSerializer(many=True, read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    questionnaire_title = serializers.CharField(source='questionnaire.title', read_only=True)

    class Meta:
        model = QuestionnaireResponse
        fields = [
            'id', 'questionnaire', 'candidate', 'offer', 'is_completed',
            'submitted_at', 'created_at', 'updated_at', 'answers',
            'completion_percentage', 'candidate_name', 'candidate_email',
            'questionnaire_title'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_candidate_name(self, obj):
        """Retourne le nom complet du candidat"""
        if obj.candidate and hasattr(obj.candidate, 'candidate_profile'):
            candidate_profile = obj.candidate.candidate_profile
            full_name = f"{candidate_profile.first_name} {candidate_profile.last_name}".strip()
            return full_name if full_name else obj.candidate.email
        return obj.candidate.email if obj.candidate else ""


class QuestionnaireResponseCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création de réponses aux questionnaires
    """
    answers = QuestionAnswerSerializer(many=True)

    class Meta:
        model = QuestionnaireResponse
        fields = ['questionnaire', 'candidate', 'offer', 'answers']

    def create(self, validated_data):
        """Créer la réponse avec ses réponses individuelles"""
        answers_data = validated_data.pop('answers', [])
        response = QuestionnaireResponse.objects.create(**validated_data)
        
        # Créer les réponses individuelles
        for answer_data in answers_data:
            QuestionAnswer.objects.create(response=response, **answer_data)
        
        return response


class VirtualApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les candidatures virtuelles
    """
    candidate_name = serializers.CharField(read_only=True)
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    candidate_photo = serializers.SerializerMethodField()
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    offer_company = serializers.CharField(source='offer.company.name', read_only=True)
    recruiter_name = serializers.CharField(read_only=True)
    selected_slot_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    offer = serializers.SerializerMethodField()
    questionnaire_responses = serializers.SerializerMethodField()
    
    class Meta:
        model = VirtualApplication
        fields = [
            'id', 'candidate', 'candidate_name', 'candidate_email', 'candidate_photo',
            'offer', 'offer_title', 'offer_company', 'recruiter_name',
            'forum', 'selected_slot', 'selected_slot_info',
            'questionnaire_responses', 'status', 'status_display',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_candidate_photo(self, obj):
        """Retourne la photo du candidat"""
        if obj.candidate and hasattr(obj.candidate, 'candidate_profile'):
            candidate_profile = obj.candidate.candidate_profile
            if hasattr(candidate_profile, 'profile_picture') and candidate_profile.profile_picture:
                return candidate_profile.profile_picture.url
        return None

    def get_offer(self, obj):
        """Retourne l'objet offre complet"""
        if obj.offer:
            try:
                recruiter_name = obj.recruiter_name
            except AttributeError:
                recruiter_name = "Recruteur inconnu"
            
            return {
                'id': obj.offer.id,
                'title': obj.offer.title,
                'description': obj.offer.description,
                'location': obj.offer.location,
                'sector': obj.offer.sector,
                'contract_type': obj.offer.contract_type,
                'profile_recherche': obj.offer.profile_recherche,
                'status': obj.offer.status,
                'start_date': obj.offer.start_date,
                'experience_required': obj.offer.experience_required,
                'created_at': obj.offer.created_at,
                'company': {
                    'id': obj.offer.company.id,
                    'name': obj.offer.company.name,
                    'description': getattr(obj.offer.company, 'description', ''),
                    'website': getattr(obj.offer.company, 'website', ''),
                    'logo': obj.offer.company.logo.url if hasattr(obj.offer.company, 'logo') and obj.offer.company.logo else '',
                    'banner': obj.offer.company.banner.url if hasattr(obj.offer.company, 'banner') and obj.offer.company.banner else ''
                },
                'recruiter': {
                    'id': obj.offer.recruiter.id,
                    'name': recruiter_name,
                    'email': obj.offer.recruiter.user.email,
                    'phone': getattr(obj.offer.recruiter, 'phone', ''),
                    'profile_picture': obj.offer.recruiter.profile_picture.url if hasattr(obj.offer.recruiter, 'profile_picture') and obj.offer.recruiter.profile_picture else '',
                    'full_name': self._get_recruiter_full_name(obj.offer.recruiter.user)
                },
                'forum': {
                    'id': obj.offer.forum.id,
                    'name': obj.offer.forum.name,
                    'description': obj.offer.forum.description
                }
            }
        return None

    def get_questionnaire_responses(self, obj):
        """Retourne les réponses au questionnaire en nettoyant les données binaires"""
        if obj.questionnaire_responses:
            # Créer une copie pour éviter de modifier l'original
            responses = obj.questionnaire_responses.copy()
            
            # Nettoyer les données binaires dans les réponses
            if isinstance(responses, dict) and 'answers' in responses:
                answers = responses['answers']
                if isinstance(answers, list):
                    for answer in answers:
                        if isinstance(answer, dict):
                            # Remplacer les données binaires par des URLs ou des messages
                            for key in ['answer_file', 'file_data']:
                                if key in answer and answer[key]:
                                    if isinstance(answer[key], bytes):
                                        answer[key] = '[Fichier binaire]'
                                    elif isinstance(answer[key], str) and len(answer[key]) > 1000:
                                        # Si c'est une chaîne très longue, c'est probablement du base64
                                        answer[key] = '[Fichier encodé]'
            
            return responses
        return None

    def _get_recruiter_full_name(self, user):
        """Helper method to get recruiter full name"""
        if hasattr(user, 'recruiter_profile'):
            recruiter_profile = user.recruiter_profile
            full_name = f"{recruiter_profile.first_name} {recruiter_profile.last_name}".strip()
            return full_name if full_name else user.email
        return user.email

    def get_selected_slot_info(self, obj):
        """Retourne les informations du créneau sélectionné"""
        if obj.selected_slot:
            slot = obj.selected_slot
            slot_info = {
                'id': slot.id,
                'date': slot.date.strftime('%Y-%m-%d') if slot.date else None,
                'start_time': slot.start_time.strftime('%H:%M:%S') if slot.start_time else None,
                'end_time': slot.end_time.strftime('%H:%M:%S') if slot.end_time else None,
                'type': slot.type,
                'status': slot.status,
                'duration': slot.duration,
                'description': slot.description,
                'meeting_link': slot.meeting_link,
                'phone_number': slot.phone_number,
                'notes': slot.notes,
                'recruiter': {
                    'id': slot.recruiter.id,
                    'name': slot.recruiter.email,
                    'full_name': self._get_recruiter_full_name(slot.recruiter)
                } if slot.recruiter else None,
                'created_at': slot.created_at.isoformat() if slot.created_at else None,
                'updated_at': slot.updated_at.isoformat() if slot.updated_at else None
            }
            return slot_info
        return None


class VirtualApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une candidature virtuelle
    """
    class Meta:
        model = VirtualApplication
        fields = [
            'offer', 'forum', 'selected_slot', 'questionnaire_responses'
        ]

    def validate(self, data):
        """Validation personnalisée"""
        candidate = self.context['request'].user
        
        # Vérifier que le candidat n'a pas déjà postulé à cette offre
        existing_application = VirtualApplication.objects.filter(
            candidate=candidate, 
            offer=data['offer']
        ).first()
        
        if existing_application:
            raise serializers.ValidationError(
                "Vous avez déjà postulé à cette offre."
            )
        
        # Vérifier que le créneau est disponible si sélectionné
        if data.get('selected_slot'):
            slot = data['selected_slot']
            if slot.status != 'available':
                raise serializers.ValidationError(
                    "Ce créneau n'est plus disponible."
                )
        
        return data

    def create(self, validated_data):
        """Créer la candidature"""
        candidate = self.context['request'].user
        validated_data['candidate'] = candidate
        
        print(f"🔍 [SERIALIZER] Création candidature pour: {candidate.email}")
        print(f"🔍 [SERIALIZER] Données validées: {validated_data}")
        
        # Réserver le slot si sélectionné
        selected_slot = validated_data.get('selected_slot')
        if selected_slot:
            print(f"🔍 [SERIALIZER] Réservation du slot: {selected_slot.id}")
            selected_slot.status = 'booked'
            selected_slot.candidate = candidate
            selected_slot.save()
            print(f"✅ [SERIALIZER] Slot réservé avec succès")
        else:
            print(f"🔍 [SERIALIZER] Aucun slot sélectionné")
        
        # Vérifier les réponses au questionnaire
        questionnaire_responses = validated_data.get('questionnaire_responses')
        if questionnaire_responses:
            print(f"🔍 [SERIALIZER] Réponses questionnaire: {questionnaire_responses}")
        else:
            print(f"🔍 [SERIALIZER] Aucune réponse au questionnaire")
        
        application = super().create(validated_data)
        print(f"✅ [SERIALIZER] Candidature créée: {application.id}")
        return application