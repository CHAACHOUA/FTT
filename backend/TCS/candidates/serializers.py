# users/serializers.py

from rest_framework import serializers
from .models import Candidate, Experience, Education, Skill, CandidateLanguage, Language
from users.models import User


from users.utils import send_user_token


class CandidateRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Candidate
        exclude = ['user']

    def create(self, validated_data):
        # Récupération des données
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        # Création de l'utilisateur et du candidat
        user = User.objects.create_user(email=email, password=password, role='candidate')
        candidate = Candidate.objects.create(user=user, **validated_data)

        try:
            # Envoi du lien de validation par email
            send_user_token(user, "activation")
        except Exception as e:
            # Si l'envoi échoue, on supprime l'utilisateur et le candidat
            print(f"Error sending activation email: {e}")
            user.delete()
            candidate.delete()
            raise serializers.ValidationError("Activation email could not be sent. Please try again.")

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
            'experiences',
            'educations',
            'skills',
            'candidate_languages',
            'title',
            'email',
            'profile_picture'
        ]
