from rest_framework import serializers

from .models import Forum, ForumRegistration
from organizers.serializers import OrganizerSerializer


class ForumSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Forum
        fields = '__all__'

class ForumRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumRegistration
        fields = '__all__'
        read_only_fields = ['registered_at']