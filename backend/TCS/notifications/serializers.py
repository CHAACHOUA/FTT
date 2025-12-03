from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    
    type_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    def get_type_display(self, obj):
        """Retourne le libellé du type"""
        return dict(obj.TYPE_CHOICES).get(obj.type, obj.type)
    
    def get_priority_display(self, obj):
        """Retourne le libellé de la priorité"""
        return dict(obj.PRIORITY_CHOICES).get(obj.priority, obj.priority)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'type_display',
            'title',
            'message',
            'is_read',
            'priority',
            'priority_display',
            'related_object_type',
            'related_object_id',
            'action_url',
            'created_at',
            'read_at',
            'time_ago',
        ]
        read_only_fields = ['created_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Retourne le temps écoulé depuis la création"""
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        
        if delta.days > 0:
            return f"Il y a {delta.days} jour{'s' if delta.days > 1 else ''}"
        elif delta.seconds >= 3600:
            hours = delta.seconds // 3600
            return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
        elif delta.seconds >= 60:
            minutes = delta.seconds // 60
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        else:
            return "À l'instant"


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une notification"""
    
    class Meta:
        model = Notification
        fields = [
            'user',
            'type',
            'title',
            'message',
            'priority',
            'related_object_type',
            'related_object_id',
            'action_url',
        ]

