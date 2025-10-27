from rest_framework import serializers
from .models import User


class UserTimezoneSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du fuseau horaire de l'utilisateur"""
    
    class Meta:
        model = User
        fields = ['timezone']
    
    def validate_timezone(self, value):
        """Valider que le fuseau horaire est valide"""
        import pytz
        try:
            pytz.timezone(value)
            return value
        except pytz.exceptions.UnknownTimeZoneError:
            raise serializers.ValidationError(f"Fuseau horaire invalide: {value}")


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour les informations de profil de l'utilisateur"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'timezone', 'is_active', 'created_at', 'last_login']
        read_only_fields = ['id', 'email', 'role', 'is_active', 'created_at', 'last_login']