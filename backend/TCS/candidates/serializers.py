# users/serializers.py

from rest_framework import serializers
from .models import Candidate, Experience, Education, Skill, CandidateLanguage, Language
from users.models import User
from forums.serializers import CandidateSearchSerializer


class CandidateRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Candidate
        exclude = ['user']

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        user = User.objects.create_user(email=email, password=password, role='candidate')
        candidate = Candidate.objects.create(user=user, **validated_data)

        return candidate


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class CandidateLanguageSerializer(serializers.ModelSerializer):
    language = serializers.StringRelatedField()

    class Meta:
        model = CandidateLanguage
        fields = ['language', 'level']


class CandidateSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    candidate_languages = CandidateLanguageSerializer(many=True, read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    class Meta:
        model = Candidate
        fields = [
            'user',
            'first_name',
            'last_name',
            'phone',
            'linkedin',
            'education_level',
            'preferred_contract_type',
            'cv_file',
            'bio',
            'experiences',
            'educations',
            'skills',
            'candidate_languages',
            'title',
            'email',
            'profile_picture',
            'public_token'
        ]

