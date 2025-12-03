from rest_framework import serializers
from .models import Forum, ForumRegistration, CandidateSearch, Speaker, Programme, ProgrammeRegistration
from organizers.serializers import OrganizerSerializer
from company.serializers import CompanyWithRecruitersSerializer


class SpeakerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Speaker
        fields = ['id', 'first_name', 'last_name', 'full_name', 'photo', 'position']


class ProgrammeSerializer(serializers.ModelSerializer):
    speakers = SpeakerSerializer(many=True, read_only=True)
    meeting_link = serializers.SerializerMethodField()
    enable_zoom = serializers.BooleanField(write_only=True, required=False, default=False)
    has_zoom_meeting = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    
    class Meta:
        model = Programme
        fields = [
            'id',
            'title',
            'description',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'location',
            'speakers',
            'enable_zoom',
            'has_zoom_meeting',
            'meeting_link',
            'participants_count',
            'is_registered',
        ]
    
    def get_has_zoom_meeting(self, obj):
        """Indique si le programme a un lien Zoom (pour l'affichage du bouton d'inscription)"""
        return bool(obj.meeting_link) or obj.enable_zoom
    
    def get_meeting_link(self, obj):
        """
        Retourne le lien Zoom selon les permissions :
        - Organizer et recruteurs : toujours visible si présent
        - Candidats : visible seulement s'ils sont inscrits ET 10 minutes avant le début
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        if not obj.meeting_link:
            return None
        
        # Organizer et recruteurs voient toujours le lien
        if hasattr(request.user, 'organizer_profile') or request.user.role == 'recruiter':
            return obj.meeting_link
        
        # Candidats : seulement s'ils sont inscrits ET 10 minutes avant
        if request.user.role == 'candidate':
            if obj.should_show_zoom_link_to_candidate(request.user):
                return obj.meeting_link
            return None
        
        # Par défaut, ne pas afficher
        return None
    
    def get_participants_count(self, obj):
        """Retourne le nombre de participants inscrits"""
        return obj.get_participants_count()
    
    def get_is_registered(self, obj):
        """Vérifie si l'utilisateur actuel est inscrit au programme"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.is_candidate_registered(request.user)


class ForumSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    programmes = ProgrammeSerializer(many=True, read_only=True)
    current_phase = serializers.SerializerMethodField()
    phase_display = serializers.SerializerMethodField()
    is_virtual = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'id',
            'name',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'type',
            'description',
            'organizer',
            'programmes',
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end',
            'current_phase',
            'phase_display',
            'is_virtual',
        ]
    
    def get_current_phase(self, obj):
        return obj.get_current_phase()
    
    def get_phase_display(self, obj):
        return obj.get_phase_display()
    
    def get_is_virtual(self, obj):
        return obj.is_virtual_forum()
    
    def validate(self, data):
        """Validation personnalisée pour les dates des forums virtuels"""
        errors = {}
        
        # Récupérer les dates du forum (soit depuis data, soit depuis l'instance existante)
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Si on est en mode update, récupérer les dates existantes si non fournies
        if self.instance:
            start_date = start_date if 'start_date' in data else self.instance.start_date
            end_date = end_date if 'end_date' in data else self.instance.end_date
        
        # Vérifier que start_date et end_date sont définies
        if not start_date or not end_date:
            return data  # La validation des dates de base se fera ailleurs
        
        # Convertir en date si nécessaire (pour comparer avec les DateTimeField)
        from datetime import datetime, date
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Liste des champs de dates virtuelles à valider
        virtual_date_fields = [
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end'
        ]
        
        # Vérifier chaque date virtuelle
        for field_name in virtual_date_fields:
            field_value = data.get(field_name)
            
            # Si la valeur est fournie dans data
            if field_value is not None:
                # Convertir en date si c'est un datetime
                if isinstance(field_value, datetime):
                    field_date = field_value.date()
                elif isinstance(field_value, str):
                    # Essayer de parser comme datetime-local (YYYY-MM-DDTHH:MM)
                    try:
                        field_date = datetime.strptime(field_value, '%Y-%m-%dT%H:%M').date()
                    except ValueError:
                        try:
                            field_date = datetime.strptime(field_value, '%Y-%m-%d %H:%M:%S').date()
                        except ValueError:
                            field_date = datetime.strptime(field_value, '%Y-%m-%d').date()
                elif isinstance(field_value, date):
                    field_date = field_value
                else:
                    continue
                
                # Vérifier que la date est dans la plage du forum
                if field_date < start_date:
                    errors[field_name] = f"La date {field_name} ({field_date}) doit être après ou égale à la date de début du forum ({start_date})"
                elif field_date > end_date:
                    errors[field_name] = f"La date {field_name} ({field_date}) doit être avant ou égale à la date de fin du forum ({end_date})"
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data


class ForumDetailSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    companies = serializers.SerializerMethodField()
    programmes = ProgrammeSerializer(many=True, read_only=True)
    current_phase = serializers.SerializerMethodField()
    phase_display = serializers.SerializerMethodField()
    is_virtual = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'id',
            'name',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'type',
            'description',
            'organizer',
            'companies',
            'programmes',
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end',
            'current_phase',
            'phase_display',
            'is_virtual',
        ]
    
    def get_current_phase(self, obj):
        return obj.get_current_phase()
    
    def get_phase_display(self, obj):
        return obj.get_phase_display()
    
    def get_is_virtual(self, obj):
        return obj.is_virtual_forum()
    
    def validate(self, data):
        """Validation personnalisée pour les dates des forums virtuels"""
        errors = {}
        
        # Récupérer les dates du forum (soit depuis data, soit depuis l'instance existante)
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Si on est en mode update, récupérer les dates existantes si non fournies
        if self.instance:
            start_date = start_date if 'start_date' in data else self.instance.start_date
            end_date = end_date if 'end_date' in data else self.instance.end_date
        
        # Vérifier que start_date et end_date sont définies
        if not start_date or not end_date:
            return data  # La validation des dates de base se fera ailleurs
        
        # Convertir en date si nécessaire (pour comparer avec les DateTimeField)
        from datetime import datetime, date
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Liste des champs de dates virtuelles à valider
        virtual_date_fields = [
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end'
        ]
        
        # Vérifier chaque date virtuelle
        for field_name in virtual_date_fields:
            field_value = data.get(field_name)
            
            # Si la valeur est fournie dans data
            if field_value is not None:
                # Convertir en date si c'est un datetime
                if isinstance(field_value, datetime):
                    field_date = field_value.date()
                elif isinstance(field_value, str):
                    # Essayer de parser comme datetime-local (YYYY-MM-DDTHH:MM)
                    try:
                        field_date = datetime.strptime(field_value, '%Y-%m-%dT%H:%M').date()
                    except ValueError:
                        try:
                            field_date = datetime.strptime(field_value, '%Y-%m-%d %H:%M:%S').date()
                        except ValueError:
                            field_date = datetime.strptime(field_value, '%Y-%m-%d').date()
                elif isinstance(field_value, date):
                    field_date = field_value
                else:
                    continue
                
                # Vérifier que la date est dans la plage du forum
                if field_date < start_date:
                    errors[field_name] = f"La date {field_name} ({field_date}) doit être après ou égale à la date de début du forum ({start_date})"
                elif field_date > end_date:
                    errors[field_name] = f"La date {field_name} ({field_date}) doit être avant ou égale à la date de fin du forum ({end_date})"
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data

    def get_companies(self, obj):
        forum = obj
        forum_companies = forum.company_participants.all()  # ForumCompany queryset
        companies = [fc.company for fc in forum_companies]

        return CompanyWithRecruitersSerializer(
            companies,
            many=True,
            context={'forum': forum}
        ).data

class CandidateSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateSearch
        fields = '__all__'

class ForumRegistrationSerializer(serializers.ModelSerializer):
    search = CandidateSearchSerializer()

    class Meta:
        model = ForumRegistration
        fields = '__all__'
        read_only_fields = ['registered_at']

    def create(self, validated_data):
        search_data = validated_data.pop('search')
        search = CandidateSearch.objects.create(**search_data)
        return ForumRegistration.objects.create(search=search, **validated_data)

class ForumCandidateSerializer(serializers.ModelSerializer):
    candidate = serializers.SerializerMethodField()
    search = CandidateSearchSerializer(read_only=True)

    class Meta:
        model = ForumRegistration
        fields = ['candidate', 'search']

    def get_candidate(self, obj):
        from candidates.serializers import CandidateSerializer
        return CandidateSerializer(obj.candidate).data
