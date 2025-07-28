from rest_framework import serializers
from .models import Organizer


class OrganizerSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Organizer
        fields = ['id', 'name', 'phone_number', 'logo', 'email']