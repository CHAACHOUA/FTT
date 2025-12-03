from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer
)
from notifications.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

# Classe simple pour simuler une requête sans RequestFactory
class SimpleRequest:
    """Classe simple pour simuler une requête HTTP sans utiliser RequestFactory"""
    def __init__(self, user):
        self.user = user
        self.is_authenticated = True
    
    def build_absolute_uri(self, path):
        """Simule build_absolute_uri pour les serializers qui en ont besoin"""
        # Retourner un chemin relatif ou une URL par défaut
        return path if path.startswith('http') else f'http://localhost:8000{path}'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_list(request):
    """
    Liste des conversations de l'utilisateur connecté
    Pour les recruteurs: conversations de leur entreprise
    Pour les candidats: leurs conversations
    """
    try:
        user = request.user
        forum_id = request.query_params.get('forum_id', None)
        
        # Si c'est un recruteur, récupérer les conversations de son entreprise
        if hasattr(user, 'recruiter_profile'):
            company = user.recruiter_profile.company
            conversations = Conversation.objects.filter(company=company)
        # Si c'est un candidat, récupérer ses conversations
        elif hasattr(user, 'candidate_profile'):
            conversations = Conversation.objects.filter(candidate=user)
        else:
            conversations = Conversation.objects.none()
        
        if forum_id:
            conversations = conversations.filter(forum_id=forum_id)
        
        # Annoter avec le nombre de messages non lus et le dernier message
        conversations = conversations.annotate(
            unread_count=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=user)),
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time', '-updated_at')
        
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des conversations: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la récupération des conversations'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, conversation_id):
    """
    Détails d'une conversation
    """
    try:
        user = request.user
        
        # Si c'est un recruteur, vérifier que la conversation appartient à son entreprise
        if hasattr(user, 'recruiter_profile'):
            company = user.recruiter_profile.company
            conversation = Conversation.objects.filter(
                id=conversation_id,
                company=company
            ).first()
        # Si c'est un candidat, vérifier qu'il fait partie de la conversation
        elif hasattr(user, 'candidate_profile'):
            conversation = Conversation.objects.filter(
                id=conversation_id,
                candidate=user
            ).first()
        else:
            conversation = None
        
        if not conversation:
            return Response(
                {'error': 'Conversation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération de la conversation: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la récupération de la conversation'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def conversation_create(request):
    """
    Créer une nouvelle conversation
    Les recruteurs peuvent créer directement, les candidats créent avec status='pending'
    """
    try:
        user = request.user
        data = request.data.copy()
        
        # Si c'est un candidat qui crée, le status est 'pending'
        if hasattr(user, 'candidate_profile'):
            data['status'] = 'pending'
            data['candidate'] = user.id
            if 'company' not in data:
                return Response(
                    {'error': 'L\'ID de l\'entreprise est requis.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif hasattr(user, 'recruiter_profile'):
            # Les recruteurs peuvent créer directement avec status='accepted'
            data['status'] = 'accepted'
            data['recruiter'] = user.id
            data['company'] = user.recruiter_profile.company.id
            # S'assurer que candidate est présent dans les données
            if 'candidate' not in data:
                return Response(
                    {'error': 'L\'ID du candidat est requis.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Vous devez être un recruteur ou un candidat pour créer une conversation.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(f"📝 [CONV_CREATE] Données reçues: {data}")
        logger.info(f"📝 [CONV_CREATE] Utilisateur: {user.email}, Type: {'candidate' if hasattr(user, 'candidate_profile') else 'recruiter' if hasattr(user, 'recruiter_profile') else 'unknown'}")
        
        serializer = ConversationCreateSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            logger.error(f"❌ Erreurs de validation: {serializer.errors}")
            logger.error(f"❌ Données envoyées: {data}")
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation = serializer.save()
        
        # Envoyer des notifications
        if hasattr(user, 'candidate_profile'):
            # Notifier tous les recruteurs de l'entreprise
            from company.models import Company
            company = Company.objects.get(id=conversation.company_id)
            for recruiter in company.recruiters.all():
                NotificationService.create_notification(
                    user=recruiter.user,
                    notification_type='chat_request',
                    title='Nouvelle demande de conversation',
                    message=f'Un candidat souhaite entrer en contact avec votre entreprise.',
                    priority='high',
                    related_object_type='conversation',
                    related_object_id=conversation.id,
                    action_url=f'/forums/{conversation.forum.id}/chat/{conversation.id}'
                )
            
            # Notifier la création via WebSocket
            try:
                channel_layer = get_channel_layer()
                if channel_layer:
                    # Recharger la conversation avec toutes les relations
                    conversation.refresh_from_db()
                    conversation_obj = Conversation.objects.select_related(
                        'forum', 'company', 'candidate', 'recruiter'
                    ).prefetch_related('messages').get(id=conversation.id)
                    
                    # Sérialiser pour le candidat (ConversationSerializer est déjà importé en haut)
                    candidate_request = SimpleRequest(conversation_obj.candidate)
                    candidate_serializer = ConversationSerializer(conversation_obj, context={'request': candidate_request})
                    
                    async_to_sync(channel_layer.group_send)(
                        f'user_{conversation_obj.candidate_id}_conversations',
                        {
                            'type': 'conversation_list_updated',
                            'conversation_id': conversation_obj.id,
                            'conversation': candidate_serializer.data
                        }
                    )
                    
                    # Sérialiser pour tous les recruteurs de l'entreprise
                    from company.models import Company
                    company = Company.objects.get(id=conversation_obj.company_id)
                    for recruiter in company.recruiters.all():
                        recruiter_request = SimpleRequest(recruiter.user)
                        recruiter_serializer = ConversationSerializer(conversation_obj, context={'request': recruiter_request})
                        
                        async_to_sync(channel_layer.group_send)(
                            f'user_{recruiter.user_id}_conversations',
                            {
                                'type': 'conversation_list_updated',
                                'conversation_id': conversation_obj.id,
                                'conversation': recruiter_serializer.data
                            }
                        )
            except Exception as e:
                logger.error(f"Erreur WebSocket création: {str(e)}")
            
        response_serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création de la conversation: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la création de la conversation'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def conversation_update_status(request, conversation_id):
    """
    Mettre à jour le statut d'une conversation (accepter/refuser)
    Seuls les recruteurs de l'entreprise peuvent modifier le statut
    """
    try:
        user = request.user
        
        if not hasattr(user, 'recruiter_profile'):
            return Response(
                {'error': 'Seuls les recruteurs peuvent modifier le statut d\'une conversation.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        company = user.recruiter_profile.company
        conversation = Conversation.objects.filter(
            id=conversation_id,
            company=company
        ).first()
        
        if not conversation:
            return Response(
                {'error': 'Conversation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status not in ['accepted', 'rejected']:
            return Response(
                {'error': 'Statut invalide. Utilisez "accepted" ou "rejected".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation.status = new_status
        conversation.recruiter = user
        conversation.save()
        
        # Envoyer une notification au candidat
        notification_type = 'chat_accepted' if new_status == 'accepted' else 'chat_rejected'
        NotificationService.create_notification(
            user=conversation.candidate,
            notification_type=notification_type,
            title=f'Demande de conversation {new_status}',
            message=f'Votre demande de conversation a été {new_status}.',
            priority='high',
            related_object_type='conversation',
            related_object_id=conversation.id,
            action_url=f'/forums/{conversation.forum.id}/chat/{conversation.id}'
        )
        
        # Notifier la mise à jour via WebSocket avec données complètes
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                # Recharger la conversation avec toutes les relations
                conversation.refresh_from_db()
                conversation_obj = Conversation.objects.select_related(
                    'forum', 'company', 'candidate', 'recruiter'
                ).prefetch_related('messages').get(id=conversation.id)
                
                # Sérialiser pour le candidat
                from .serializers import ConversationSerializer
                
                candidate_request = SimpleRequest(conversation_obj.candidate)
                candidate_serializer = ConversationSerializer(conversation_obj, context={'request': candidate_request})
                
                async_to_sync(channel_layer.group_send)(
                    f'user_{conversation_obj.candidate_id}_conversations',
                    {
                        'type': 'conversation_list_updated',
                        'conversation_id': conversation_obj.id,
                        'conversation': candidate_serializer.data
                    }
                )
                
                # Sérialiser pour tous les recruteurs de l'entreprise
                from company.models import Company
                company = Company.objects.get(id=conversation_obj.company_id)
                for recruiter in company.recruiters.all():
                    recruiter_request = SimpleRequest(recruiter.user)
                    recruiter_serializer = ConversationSerializer(conversation_obj, context={'request': recruiter_request})
                    
                    async_to_sync(channel_layer.group_send)(
                        f'user_{recruiter.user_id}_conversations',
                        {
                            'type': 'conversation_list_updated',
                            'conversation_id': conversation_obj.id,
                            'conversation': recruiter_serializer.data
                        }
                    )
        except Exception as e:
            logger.error(f"Erreur WebSocket: {str(e)}")
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la mise à jour du statut: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la mise à jour du statut'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_list(request, conversation_id):
    """
    Liste des messages d'une conversation
    """
    try:
        user = request.user
        
        # Vérifier que l'utilisateur fait partie de la conversation
        if hasattr(user, 'recruiter_profile'):
            company = user.recruiter_profile.company
            conversation = Conversation.objects.filter(
                id=conversation_id,
                company=company
            ).first()
        elif hasattr(user, 'candidate_profile'):
            conversation = Conversation.objects.filter(
                id=conversation_id,
                candidate=user
            ).first()
        else:
            conversation = None
        
        if not conversation:
            return Response(
                {'error': 'Conversation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        messages = conversation.messages.all().order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des messages: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la récupération des messages'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def message_create(request):
    """
    Créer un nouveau message
    """
    try:
        data = request.data.copy()
        serializer = MessageCreateSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            message = serializer.save()
            
            # Notification au destinataire
            conversation = message.conversation
            if request.user == conversation.candidate:
                # Le message vient du candidat, notifier tous les recruteurs
                from company.models import Company
                company = Company.objects.get(id=conversation.company_id)
                for recruiter in company.recruiters.all():
                    NotificationService.create_notification(
                        user=recruiter.user,
                        notification_type='new_message',
                        title='Nouveau message',
                        message=f'Vous avez reçu un nouveau message de {request.user.email}.',
                        priority='high',
                        related_object_type='message',
                        related_object_id=message.id,
                        action_url=f'/forums/{conversation.forum.id}/chat/{conversation.id}'
                    )
            else:
                # Le message vient d'un recruteur, notifier le candidat
                NotificationService.create_notification(
                    user=conversation.candidate,
                    notification_type='new_message',
                    title='Nouveau message',
                    message=f'Vous avez reçu un nouveau message de {request.user.email}.',
                    priority='high',
                    related_object_type='message',
                    related_object_id=message.id,
                    action_url=f'/forums/{conversation.forum.id}/chat/{conversation.id}'
                )
            
            # Envoyer via WebSocket au groupe de la conversation
            try:
                channel_layer = get_channel_layer()
                if channel_layer:
                    message_serializer = MessageSerializer(message, context={'request': request})
                    async_to_sync(channel_layer.group_send)(
                        f'chat_{conversation.id}',
                        {
                            'type': 'chat_message',
                            'message': message_serializer.data
                        }
                    )
            except Exception as e:
                logger.error(f"Erreur WebSocket: {str(e)}")
            
            # Notifier la mise à jour de la liste des conversations
            try:
                channel_layer = get_channel_layer()
                if channel_layer:
                    # Recharger la conversation avec toutes les relations
                    conversation.refresh_from_db()
                    conversation_obj = Conversation.objects.select_related(
                        'forum', 'company', 'candidate', 'recruiter'
                    ).prefetch_related('messages').get(id=conversation.id)
                    
                    # Sérialiser pour le candidat (ConversationSerializer est déjà importé en haut)
                    candidate_request = SimpleRequest(conversation_obj.candidate)
                    candidate_serializer = ConversationSerializer(conversation_obj, context={'request': candidate_request})
                    
                    async_to_sync(channel_layer.group_send)(
                        f'user_{conversation_obj.candidate_id}_conversations',
                        {
                            'type': 'conversation_list_updated',
                            'conversation_id': conversation_obj.id,
                            'conversation': candidate_serializer.data
                        }
                    )
                    
                    # Sérialiser pour tous les recruteurs de l'entreprise
                    from company.models import Company
                    company = Company.objects.get(id=conversation_obj.company_id)
                    for recruiter in company.recruiters.all():
                        recruiter_request = SimpleRequest(recruiter.user)
                        recruiter_serializer = ConversationSerializer(conversation_obj, context={'request': recruiter_request})
                        
                        async_to_sync(channel_layer.group_send)(
                            f'user_{recruiter.user_id}_conversations',
                            {
                                'type': 'conversation_list_updated',
                                'conversation_id': conversation_obj.id,
                                'conversation': recruiter_serializer.data
                            }
                        )
            except Exception as e:
                logger.error(f"Erreur WebSocket liste: {str(e)}")
            
            response_serializer = MessageSerializer(message, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création du message: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la création du message'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def message_mark_read(request, message_id):
    """
    Marquer un message comme lu
    """
    try:
        message = Message.objects.get(id=message_id)
        
        # Vérifier que l'utilisateur peut voir ce message
        conversation = message.conversation
        user = request.user
        
        is_authorized = False
        if hasattr(user, 'recruiter_profile'):
            is_authorized = user.recruiter_profile.company == conversation.company
        elif user == conversation.candidate:
            is_authorized = True
        
        if not is_authorized:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à voir ce message.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if message.sender != user:
            message.mark_as_read()
        
        return Response({'success': True}, status=status.HTTP_200_OK)
        
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"❌ Erreur lors du marquage du message: {str(e)}")
        return Response(
            {'error': 'Erreur lors du marquage du message'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def conversation_mark_all_read(request, conversation_id):
    """
    Marquer tous les messages d'une conversation comme lus
    """
    try:
        user = request.user
        
        # Vérifier que l'utilisateur fait partie de la conversation
        if hasattr(user, 'recruiter_profile'):
            company = user.recruiter_profile.company
            conversation = Conversation.objects.filter(
                id=conversation_id,
                company=company
            ).first()
        elif hasattr(user, 'candidate_profile'):
            conversation = Conversation.objects.filter(
                id=conversation_id,
                candidate=user
            ).first()
        else:
            conversation = None
        
        if not conversation:
            return Response(
                {'error': 'Conversation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Marquer tous les messages non lus comme lus
        from django.utils import timezone
        conversation.messages.filter(is_read=False).exclude(sender=user).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({'success': True}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du marquage des messages: {str(e)}")
        return Response(
            {'error': 'Erreur lors du marquage des messages'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
