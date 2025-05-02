# users/serializers.py

from rest_framework import serializers
from .models import User, Candidate

class CandidateRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    linkedin = serializers.URLField(required=False, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    preferred_contract_type = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        # Create the user
        user = User.objects.create_user(email=email, password=password, role='candidate')

        # Create the candidate profile
        Candidate.objects.create(user=user, **validated_data)

        return user
