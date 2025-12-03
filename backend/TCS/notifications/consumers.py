import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Notification
from .serializers import NotificationSerializer

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer WebSocket pour les notifications en temps réel"""
    
    async def connect(self):
        """Connexion WebSocket avec authentification JWT"""
        # L'utilisateur est déjà authentifié par le middleware
        self.user = self.scope["user"]
        
        # Vérifier que l'utilisateur est authentifié
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        # Créer un groupe par utilisateur
        self.room_group_name = f'notifications_{self.user.id}'
        
        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Envoyer le nombre de notifications non lues au moment de la connexion
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))
    
    async def disconnect(self, close_code):
        """Déconnexion WebSocket"""
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recevoir un message du client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_unread_count':
                # Envoyer le nombre de notifications non lues
                unread_count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': unread_count
                }))
            elif message_type == 'get_notifications':
                # Envoyer les notifications
                notifications = await self.get_notifications()
                await self.send(text_data=json.dumps({
                    'type': 'notifications',
                    'notifications': notifications
                }))
        except json.JSONDecodeError:
            pass
    
    async def notification_created(self, event):
        """Envoyer une nouvelle notification au client"""
        notification_data = event['notification']
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': notification_data
        }))
        
        # Mettre à jour le compteur
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))
    
    async def notification_updated(self, event):
        """Envoyer une notification mise à jour au client"""
        # Construire le message de réponse
        response_data = {
            'type': 'notification_updated'
        }
        
        # Ajouter la notification si elle est présente
        if 'notification' in event:
            response_data['notification'] = event['notification']
        
        # Ajouter le compteur non lu si présent, sinon le récupérer
        if 'unread_count' in event:
            response_data['unread_count'] = event['unread_count']
        else:
            # Récupérer le compteur actuel
            unread_count = await self.get_unread_count()
            response_data['unread_count'] = unread_count
        
        await self.send(text_data=json.dumps(response_data))
    
    @database_sync_to_async
    def get_unread_count(self):
        """Récupérer le nombre de notifications non lues"""
        return Notification.objects.filter(user=self.user, is_read=False).count()
    
    @database_sync_to_async
    def get_notifications(self, limit=20):
        """Récupérer les notifications"""
        notifications = Notification.objects.filter(user=self.user).order_by('-created_at')[:limit]
        serializer = NotificationSerializer(notifications, many=True)
        return serializer.data

