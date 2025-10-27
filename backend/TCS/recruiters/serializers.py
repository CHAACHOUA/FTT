from rest_framework import serializers
from company.serializers import CompanySerializer
from .models import Recruiter, Offer, FavoriteOffer
from forums.serializers import ForumSerializer

from forums.models import Forum


class RecruiterSerializer(serializers.ModelSerializer):
    company= CompanySerializer( read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    timezone = serializers.CharField(source='user.timezone', read_only=True)
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    forum_offers_count = serializers.SerializerMethodField()
    photo = serializers.ImageField(source='profile_picture', read_only=True)
    
    class Meta:
        model = Recruiter
        fields = ['id', 'first_name', 'last_name','profile_picture', 'photo', 'company','title','phone','email','timezone','created_at','last_login','forum_offers_count']
    
    def get_forum_offers_count(self, obj):
        """Compter le nombre d'offres du recruteur pour le forum spécifique"""
        forum = self.context.get('forum')
        if forum:
            return obj.offers.filter(forum=forum).count()
        return 0

class RecruiterUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des informations du recruteur"""
    class Meta:
        model = Recruiter
        fields = ['id', 'first_name', 'last_name', 'profile_picture', 'title', 'phone']
        extra_kwargs = {
            'id': {'read_only': True},
            'profile_picture': {'required': False, 'allow_null': True},
            'title': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
        }

class CompanyApprovalSerializer(serializers.ModelSerializer):
    approved = serializers.SerializerMethodField()
    
    class Meta:
        model = Recruiter
        fields = ['approved']
    
    def get_approved(self, obj):
        # Récupérer le forum depuis le contexte
        forum = self.context.get('forum')
        if not forum:
            return False
        
        # Vérifier si l'entreprise est approuvée pour ce forum
        from company.models import ForumCompany
        try:
            forum_company = ForumCompany.objects.get(company=obj.company, forum=forum)
            return forum_company.approved
        except ForumCompany.DoesNotExist:
            return False

class RecruiterForumParticipationSerializer(serializers.ModelSerializer):
    forum = ForumSerializer(read_only=True)

    class Meta:
        model = Recruiter
        fields = ['forum']


class OfferSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    company_banner = serializers.ImageField(source='company.banner', read_only=True)
    recruiter_photo = serializers.ImageField(source='recruiter.profile_picture', read_only=True)
    recruiter_name = serializers.SerializerMethodField()
    recruiter = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    experience_display = serializers.CharField(source='get_experience_required_display', read_only=True)
    questionnaire = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id',
            'title',
            'description',
            'location',
            'sector',
            'contract_type',
            'profile_recherche',
            'status',
            'status_display',
            'start_date',
            'experience_required',
            'experience_display',
            'created_at',
            'company_name',
            'recruiter_name',
            'recruiter',
            'company_logo',
            'company_banner',
            'recruiter_photo',
            'questionnaire'
        ]

    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}"
    
    def get_recruiter(self, obj):
        return {
            'id': obj.recruiter.id,
            'first_name': obj.recruiter.first_name,
            'last_name': obj.recruiter.last_name,
            'email': obj.recruiter.user.email if hasattr(obj.recruiter, 'user') else None
        }
    
    def get_questionnaire(self, obj):
        """Récupérer le questionnaire associé à l'offre"""
        try:
            # Utiliser la relation inverse depuis le modèle Questionnaire
            from virtual.models import Questionnaire
            
            try:
                questionnaire = Questionnaire.objects.select_related('offer').prefetch_related('questions').get(offer=obj)
                print(f"Questionnaire trouvé: {questionnaire.id} - {questionnaire.title}")
                
                # Retourner les données du questionnaire
                return {
                    'id': questionnaire.id,
                    'title': questionnaire.title,
                    'description': questionnaire.description,
                    'is_active': questionnaire.is_active,
                    'is_required': questionnaire.is_required,
                    'questions_count': questionnaire.questions.count(),
                    'questions': [
                        {
                            'id': q.id,
                            'question_text': q.question_text,
                            'question_type': q.question_type,
                            'is_required': q.is_required,
                            'order': q.order,
                            'options': q.options
                        } for q in questionnaire.questions.all()
                    ]
                }
            except Questionnaire.DoesNotExist:
                print("Aucun questionnaire trouvé pour cette offre")
                return None
                
        except Exception as e:
            print(f"Erreur lors de la récupération du questionnaire: {e}")
            return None


class OfferCandidateSerializer(serializers.ModelSerializer):
    """Serializer pour les candidats - sans le statut"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    company_banner = serializers.ImageField(source='company.banner', read_only=True)
    recruiter_photo = serializers.ImageField(source='recruiter.profile_picture', read_only=True)
    recruiter_name = serializers.SerializerMethodField()
    experience_display = serializers.CharField(source='get_experience_required_display', read_only=True)
    
    class Meta:
        model = Offer
        fields = [
            'id',
            'title',
            'description',
            'location',
            'sector',
            'contract_type',
            'profile_recherche',
            'start_date',
            'experience_required',
            'experience_display',
            'created_at',
            'company_name',
            'recruiter_name',
            'company_logo',
            'company_banner',
            'recruiter_photo'
        ]

    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}"

class OfferWriteSerializer(serializers.ModelSerializer):
    forum_id = serializers.PrimaryKeyRelatedField(
        queryset=Forum.objects.all(),  # remplace Forum par ton modèle Forum exact
        source='forum'  # Indique que forum_id mappe vers forum en base
    )
    questionnaire = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Offer
        fields = [
            'title',
            'description',
            'location',
            'sector',
            'contract_type',
            'profile_recherche',
            'status',
            'start_date',
            'experience_required',
            'forum_id',  # ici forum_id au lieu de forum
            'questionnaire',  # Ajouter le questionnaire
        ]
class FavoriteOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteOffer
        fields = ['id', 'candidate', 'offer', 'added_at']

