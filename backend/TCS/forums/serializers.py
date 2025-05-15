from rest_framework import serializers

from .models import Forum, ForumRegistration


class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'

class ForumRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumRegistration
        fields = '__all__'
        read_only_fields = ['registered_at']