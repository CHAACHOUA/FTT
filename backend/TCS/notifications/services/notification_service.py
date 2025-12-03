"""
Service pour créer et gérer les notifications
"""
from django.contrib.auth import get_user_model
from notifications.models import Notification
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..serializers import NotificationSerializer
import logging
import json

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationService:
    """Service pour créer et gérer les notifications"""
    
    @staticmethod
    def create_notification(
        user,
        notification_type,
        title,
        message,
        priority='medium',
        related_object_type=None,
        related_object_id=None,
        action_url=None
    ):
        """
        Crée une notification pour un utilisateur et l'envoie via WebSocket
        
        Args:
            user: Utilisateur destinataire
            notification_type: Type de notification (voir TYPE_CHOICES)
            title: Titre de la notification
            message: Message de la notification
            priority: Priorité (high, medium, low)
            related_object_type: Type d'objet lié (optionnel)
            related_object_id: ID de l'objet lié (optionnel)
            action_url: URL vers l'action associée (optionnel)
        """
        try:
            notification = Notification.objects.create(
                user=user,
                type=notification_type,
                title=title,
                message=message,
                priority=priority,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
                action_url=action_url
            )
            logger.info(f"✅ Notification créée: {notification_type} pour {user.email}")
            
            # Envoyer via WebSocket
            NotificationService.send_notification_via_websocket(notification)
            
            return notification
        except Exception as e:
            logger.error(f"❌ Erreur lors de la création de la notification: {str(e)}")
            return None
    
    @staticmethod
    def send_notification_via_websocket(notification):
        """Envoie une notification via WebSocket en temps réel"""
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                # Sérialiser la notification (sans contexte request pour WebSocket)
                serializer = NotificationSerializer(notification, context={})
                notification_data = serializer.data
                
                # Envoyer au groupe de l'utilisateur
                room_group_name = f'notifications_{notification.user.id}'
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'notification_created',
                        'notification': notification_data
                    }
                )
                logger.info(f"✅ Notification envoyée via WebSocket à {notification.user.email}")
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'envoi WebSocket: {str(e)}")
            # Ne pas bloquer si WebSocket échoue
    
    @staticmethod
    def create_notification_for_users(
        users,
        notification_type,
        title,
        message,
        priority='medium',
        related_object_type=None,
        related_object_id=None,
        action_url=None
    ):
        """Crée une notification pour plusieurs utilisateurs"""
        notifications = []
        for user in users:
            notification = NotificationService.create_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                priority=priority,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
                action_url=action_url
            )
            if notification:
                notifications.append(notification)
        return notifications
    
    @staticmethod
    def mark_as_read(notification_id, user):
        """Marque une notification comme lue et envoie la mise à jour via WebSocket"""
        try:
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.mark_as_read()
            
            # Envoyer la mise à jour via WebSocket
            try:
                channel_layer = get_channel_layer()
                if channel_layer:
                    serializer = NotificationSerializer(notification, context={})
                    unread_count = NotificationService.get_unread_count(user)
                    room_group_name = f'notifications_{user.id}'
                    async_to_sync(channel_layer.group_send)(
                        room_group_name,
                        {
                            'type': 'notification_updated',
                            'notification': serializer.data,
                            'unread_count': unread_count
                        }
                    )
            except Exception as e:
                logger.error(f"❌ Erreur WebSocket lors du marquage: {str(e)}")
            
            return notification
        except Notification.DoesNotExist:
            logger.error(f"❌ Notification {notification_id} non trouvée pour {user.email}")
            return None
    
    @staticmethod
    def mark_all_as_read(user):
        """Marque toutes les notifications d'un utilisateur comme lues et envoie la mise à jour via WebSocket"""
        updated = Notification.objects.filter(
            user=user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        logger.info(f"✅ {updated} notifications marquées comme lues pour {user.email}")
        
        # Envoyer la mise à jour via WebSocket
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                unread_count = NotificationService.get_unread_count(user)
                room_group_name = f'notifications_{user.id}'
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'notification_updated',
                        'unread_count': unread_count
                    }
                )
        except Exception as e:
            logger.error(f"❌ Erreur WebSocket lors du marquage global: {str(e)}")
        
        return updated
    
    @staticmethod
    def get_unread_count(user):
        """Retourne le nombre de notifications non lues"""
        return Notification.objects.filter(user=user, is_read=False).count()
    
    @staticmethod
    def delete_old_notifications(user, days=30):
        """Supprime les notifications de plus de X jours"""
        from datetime import timedelta
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted = Notification.objects.filter(
            user=user,
            created_at__lt=cutoff_date
        ).delete()
        logger.info(f"✅ {deleted[0]} anciennes notifications supprimées pour {user.email}")
        return deleted[0]

