from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from company.serializers import CompanySerializer

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer basique pour les utilisateurs"""
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
    
    def get_first_name(self, obj):
        """Récupère le prénom depuis le profil"""
        if hasattr(obj, 'candidate_profile'):
            return getattr(obj.candidate_profile, 'first_name', None)
        elif hasattr(obj, 'recruiter_profile'):
            return getattr(obj.recruiter_profile, 'first_name', None)
        return None
    
    def get_last_name(self, obj):
        """Récupère le nom depuis le profil"""
        if hasattr(obj, 'candidate_profile'):
            return getattr(obj.candidate_profile, 'last_name', None)
        elif hasattr(obj, 'recruiter_profile'):
            return getattr(obj.recruiter_profile, 'last_name', None)
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages"""
    sender = UserBasicSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'is_read', 'read_at', 'created_at', 'time_ago']
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Retourne le temps écoulé depuis la création"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.total_seconds() < 60:
            return "À l'instant"
        elif diff.total_seconds() < 3600:
            minutes = int(diff.total_seconds() / 60)
            return f"Il y a {minutes} min"
        elif diff.total_seconds() < 86400:
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours} h"
        else:
            days = int(diff.total_seconds() / 86400)
            return f"Il y a {days} j"
        return "À l'instant"


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations"""
    company = CompanySerializer(read_only=True)
    recruiter = UserBasicSerializer(read_only=True)
    candidate = UserBasicSerializer(read_only=True)
    forum_name = serializers.CharField(source='forum.name', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    can_send_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'forum', 'forum_name', 'company', 'recruiter', 'candidate',
            'status', 'created_at', 'updated_at', 'last_message',
            'unread_count', 'can_send_message'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """Retourne le dernier message de la conversation"""
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        """Retourne le nombre de messages non lus pour l'utilisateur actuel"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
    
    def get_can_send_message(self, obj):
        """Vérifie si l'utilisateur actuel peut envoyer un message"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Les recruteurs de l'entreprise peuvent toujours envoyer
        if hasattr(request.user, 'recruiter_profile'):
            return request.user.recruiter_profile.company == obj.company
        
        # Les candidats peuvent envoyer seulement si la conversation est acceptée
        if request.user == obj.candidate:
            return obj.status == 'accepted'
        
        return False


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une conversation"""
    
    class Meta:
        model = Conversation
        fields = ['forum', 'company', 'candidate', 'status']
    
    def validate(self, data):
        """Valide les données de création"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Vous devez être authentifié.")
        
        # Si c'est un candidat, il ne peut créer qu'avec status='pending'
        if hasattr(request.user, 'candidate_profile'):
            if data.get('status') != 'pending':
                raise serializers.ValidationError("Les candidats ne peuvent créer que des conversations en attente.")
            
            # Vérifier que candidate correspond à l'utilisateur actuel
            candidate = data.get('candidate')
            candidate_id = candidate.id if hasattr(candidate, 'id') else candidate
            if candidate_id != request.user.id:
                raise serializers.ValidationError("Vous ne pouvez créer une conversation que pour vous-même.")
        
        return data
    
    def create(self, validated_data):
        """Crée une conversation en évitant les doublons"""
        forum = validated_data.get('forum')
        company = validated_data.get('company')
        candidate = validated_data.get('candidate')
        
        # S'assurer que candidate est un ID
        candidate_id = candidate.id if hasattr(candidate, 'id') else candidate
        
        # Vérifier si une conversation existe déjà
        try:
            conversation = Conversation.objects.get(
                forum=forum,
                company=company,
                candidate_id=candidate_id
            )
            # Si la conversation existe déjà, la retourner
            return conversation
        except Conversation.DoesNotExist:
            # Créer une nouvelle conversation
            try:
                conversation = Conversation.objects.create(
                    forum=forum,
                    company=company,
                    candidate_id=candidate_id,
                    status=validated_data.get('status', 'pending'),
                    recruiter=self.context['request'].user if hasattr(self.context['request'].user, 'recruiter_profile') else None
                )
                return conversation
            except Exception as e:
                # Si erreur (ex: doublon créé entre temps), essayer de récupérer la conversation existante
                try:
                    conversation = Conversation.objects.get(
                        forum=forum,
                        company=company,
                        candidate_id=candidate_id
                    )
                    return conversation
                except Conversation.DoesNotExist:
                    raise e


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un message"""
    
    class Meta:
        model = Message
        fields = ['conversation', 'content']
    
    def validate(self, data):
        """Valide que l'utilisateur peut envoyer un message dans cette conversation"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Vous devez être authentifié pour envoyer un message.")
        
        conversation = data['conversation']
        
        # Vérifier que l'utilisateur fait partie de la conversation
        is_candidate = request.user == conversation.candidate
        is_recruiter = hasattr(request.user, 'recruiter_profile') and \
                      request.user.recruiter_profile.company == conversation.company
        
        if not (is_candidate or is_recruiter):
            raise serializers.ValidationError("Vous n'êtes pas autorisé à envoyer un message dans cette conversation.")
        
        # Vérifier les permissions selon le rôle
        if is_candidate:
            if not conversation.can_candidate_send_message():
                raise serializers.ValidationError("Vous ne pouvez pas envoyer de message tant que l'entreprise n'a pas accepté votre demande.")
        
        return data
    
    def create(self, validated_data):
        """Crée un message"""
        message = Message.objects.create(
            conversation=validated_data['conversation'],
            sender=self.context['request'].user,
            content=validated_data['content']
        )
        return message
