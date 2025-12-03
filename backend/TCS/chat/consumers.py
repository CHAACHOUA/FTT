import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """Consumer WebSocket pour le chat en temps réel"""
    
    async def connect(self):
        """Connexion WebSocket avec authentification JWT"""
        self.user = self.scope["user"]
        
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        if not conversation_id:
            await self.close()
            return
        
        try:
            conversation_id = int(conversation_id)
        except (ValueError, TypeError):
            await self.close()
            return
        
        # Vérifier que l'utilisateur fait partie de la conversation
        conversation = await self.get_conversation(conversation_id)
        if not conversation:
            await self.close()
            return
        
        self.conversation_id = conversation_id
        self.room_group_name = f'chat_{conversation_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"✅ [CHAT] {self.user.email} connecté à la conversation {conversation_id}")
    
    async def disconnect(self, close_code):
        """Déconnexion WebSocket"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"🔌 [CHAT] {getattr(self.user, 'email', 'Unknown')} déconnecté")
    
    async def receive(self, text_data):
        """Recevoir un message du client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                content = data.get('content', '').strip()
                if not content:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Le message ne peut pas être vide'
                    }))
                    return
                
                # Vérifier les permissions
                conversation = await self.get_conversation(self.conversation_id)
                if not conversation:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Conversation non trouvée'
                    }))
                    return
                
                # Vérifier que l'utilisateur peut envoyer un message
                can_send = await self.check_can_send_message(conversation)
                if not can_send:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Vous ne pouvez pas envoyer de message tant que l\'entreprise n\'a pas accepté votre demande.'
                    }))
                    return
                
                # Vérifier que le recruteur appartient à l'entreprise
                is_authorized = await self.check_user_authorized(conversation)
                if not is_authorized:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Vous n\'êtes pas autorisé à envoyer un message dans cette conversation.'
                    }))
                    return
                
                # Créer le message
                message = await self.create_message(conversation, content)
                
                # Sérialiser le message de manière asynchrone
                message_data = await self.serialize_message(message)
                
                # Envoyer le message à tous les membres du groupe
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message_data
                    }
                )
                
                # Notifier la mise à jour de la liste des conversations
                await self.notify_conversation_list_update(conversation)
            
            elif message_type == 'typing':
                # Indicateur de frappe
                # Récupérer le nom d'affichage de l'utilisateur
                user_name = await self.get_user_display_name(self.user.id)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': self.user.id,
                        'user_email': self.user.email,
                        'user_name': user_name or self.user.email,
                        'is_typing': data.get('is_typing', False)
                    }
                )
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Format de message invalide'
            }))
        except Exception as e:
            print(f"❌ [CHAT] Erreur: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Erreur lors de l\'envoi du message'
            }))
    
    async def chat_message(self, event):
        """Envoyer un message au client"""
        message_data = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message_data
        }))
    
    async def typing_indicator(self, event):
        """Envoyer l'indicateur de frappe au client"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_email': event['user_email'],
                'user_name': event.get('user_name', event['user_email']),
                'is_typing': event['is_typing']
            }))
    
    @database_sync_to_async
    def get_conversation(self, conversation_id):
        """Récupérer une conversation"""
        try:
            if hasattr(self.user, 'recruiter_profile'):
                company = self.user.recruiter_profile.company
                return Conversation.objects.filter(
                    id=conversation_id,
                    company=company
                ).first()
            elif hasattr(self.user, 'candidate_profile'):
                return Conversation.objects.filter(
                    id=conversation_id,
                    candidate=self.user
                ).first()
        except Exception as e:
            print(f"❌ [CHAT] Erreur get_conversation: {str(e)}")
        return None
    
    @database_sync_to_async
    def check_can_send_message(self, conversation):
        """Vérifier si l'utilisateur peut envoyer un message"""
        if self.user.id == conversation.candidate_id:
            return conversation.can_candidate_send_message()
        return True
    
    @database_sync_to_async
    def check_user_authorized(self, conversation):
        """Vérifier si l'utilisateur est autorisé"""
        try:
            if hasattr(self.user, 'recruiter_profile'):
                return self.user.recruiter_profile.company_id == conversation.company_id
        except Exception:
            pass
        return True
    
    @database_sync_to_async
    def create_message(self, conversation, content):
        """Créer un message"""
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        conversation.save()  # Met à jour updated_at
        return message
    
    async def notify_conversation_list_update(self, conversation):
        """Notifier la mise à jour de la liste des conversations"""
        try:
            # Récupérer les IDs de manière asynchrone
            conversation_id = await self.get_conversation_id(conversation)
            candidate_id = await self.get_candidate_id(conversation)
            company_id = await self.get_company_id(conversation)
            
            # Sérialiser la conversation pour le candidat
            candidate_data = await self.serialize_conversation_for_user(conversation, candidate_id)
            
            if candidate_data:
                await self.channel_layer.group_send(
                    f'user_{candidate_id}_conversations',
                    {
                        'type': 'conversation_list_updated',
                        'conversation_id': conversation_id,
                        'conversation': candidate_data
                    }
                )
            
            # Notifier tous les recruteurs de l'entreprise
            company = await self.get_company(company_id)
            if company:
                recruiters = await self.get_company_recruiters(company.id)
                for recruiter in recruiters:
                    recruiter_data = await self.serialize_conversation_for_user(conversation, recruiter.user_id)
                    if recruiter_data:
                        await self.channel_layer.group_send(
                            f'user_{recruiter.user_id}_conversations',
                            {
                                'type': 'conversation_list_updated',
                                'conversation_id': conversation_id,
                                'conversation': recruiter_data
                            }
                        )
        except Exception as e:
            print(f"❌ [CHAT] Erreur notification: {str(e)}")
    
    @database_sync_to_async
    def get_company(self, company_id):
        """Récupérer une entreprise"""
        from company.models import Company
        try:
            return Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_company_recruiters(self, company_id):
        """Récupérer les recruteurs d'une entreprise"""
        from recruiters.models import Recruiter
        return list(Recruiter.objects.filter(company_id=company_id).select_related('user'))
    
    @database_sync_to_async
    def get_conversation_id(self, conversation):
        """Récupérer l'ID de la conversation"""
        return conversation.id
    
    @database_sync_to_async
    def get_candidate_id(self, conversation):
        """Récupérer l'ID du candidat"""
        return conversation.candidate_id if hasattr(conversation, 'candidate_id') else conversation.candidate.id
    
    @database_sync_to_async
    def get_company_id(self, conversation):
        """Récupérer l'ID de l'entreprise"""
        return conversation.company_id if hasattr(conversation, 'company_id') else conversation.company.id
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Sérialiser un message"""
        from .serializers import MessageSerializer
        serializer = MessageSerializer(message, context={})
        return serializer.data
    
    @database_sync_to_async
    def get_user_display_name(self, user_id):
        """Récupérer le nom d'affichage d'un utilisateur"""
        try:
            user = User.objects.select_related('candidate_profile', 'recruiter_profile').get(id=user_id)
            
            # Si c'est un candidat
            if hasattr(user, 'candidate_profile'):
                profile = user.candidate_profile
                if profile.first_name and profile.last_name:
                    return f"{profile.first_name} {profile.last_name}"
                return user.email
            
            # Si c'est un recruteur
            if hasattr(user, 'recruiter_profile'):
                profile = user.recruiter_profile
                if profile.first_name and profile.last_name:
                    return f"{profile.first_name} {profile.last_name}"
                # Sinon, retourner le nom de l'entreprise
                if profile.company:
                    return profile.company.name
                return user.email
            
            return user.email
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def serialize_conversation_for_user(self, conversation, user_id):
        """Sérialiser une conversation pour un utilisateur spécifique"""
        from .serializers import ConversationSerializer
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
        
        conversation_obj = Conversation.objects.select_related(
            'forum', 'company', 'candidate', 'recruiter'
        ).prefetch_related('messages').get(id=conversation.id)
        
        # Créer une requête factice simple sans RequestFactory
        class SimpleRequest:
            def __init__(self, user):
                self.user = user
                self.is_authenticated = True
            
            def build_absolute_uri(self, path):
                """Simule build_absolute_uri pour les serializers qui en ont besoin"""
                # Retourner un chemin relatif ou une URL par défaut
                return path if path.startswith('http') else f'http://localhost:8000{path}'
        
        request = SimpleRequest(user)
        serializer = ConversationSerializer(conversation_obj, context={'request': request})
        return serializer.data


class ConversationListConsumer(AsyncWebsocketConsumer):
    """Consumer WebSocket pour les mises à jour de la liste des conversations"""
    
    async def connect(self):
        """Connexion WebSocket pour les mises à jour de la liste"""
        self.user = self.scope["user"]
        
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        self.user_group_name = f'user_{self.user.id}_conversations'
        
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"✅ [CONV_LIST] {self.user.email} connecté")
    
    async def disconnect(self, close_code):
        """Déconnexion WebSocket"""
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
        print(f"🔌 [CONV_LIST] {getattr(self.user, 'email', 'Unknown')} déconnecté")
    
    async def conversation_list_updated(self, event):
        """Notifier la mise à jour de la liste des conversations"""
        conversation_data = event.get('conversation')
        await self.send(text_data=json.dumps({
            'type': 'conversation_list_updated',
            'conversation_id': event.get('conversation_id'),
            'conversation': conversation_data
        }))
