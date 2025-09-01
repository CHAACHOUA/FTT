from rest_framework import serializers
from company.serializers import CompanySerializer
from .models import Recruiter, Offer, FavoriteOffer
from forums.serializers import ForumSerializer

from forums.models import Forum


class RecruiterSerializer(serializers.ModelSerializer):
    company= CompanySerializer( read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    class Meta:
        model = Recruiter
        fields = ['first_name', 'last_name','profile_picture', 'company','title','phone','email']

class RecruiterForumParticipationSerializer(serializers.ModelSerializer):
    forum = ForumSerializer(read_only=True)

    class Meta:
        model = Recruiter
        fields = ['forum']


class OfferSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    recruiter_photo = serializers.ImageField(source='recruiter.profile_picture', read_only=True)
    recruiter_name = serializers.SerializerMethodField()
    class Meta:
        model = Offer
        fields = [
            'id',
            'title',
            'description',
            'location',
            'sector',
            'contract_type',
            'profile_recherche',
            'created_at',
            'company_name',
            'recruiter_name',
            'company_logo',
            'recruiter_photo'
        ]

    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}"


class OfferWriteSerializer(serializers.ModelSerializer):
    forum_id = serializers.PrimaryKeyRelatedField(
        queryset=Forum.objects.all(),  # remplace Forum par ton modèle Forum exact
        source='forum'  # Indique que forum_id mappe vers forum en base
    )

    class Meta:
        model = Offer
        fields = [
            'title',
            'description',
            'location',
            'sector',
            'contract_type',
            'profile_recherche',
            'forum_id',  # ici forum_id au lieu de forum
        ]

class FavoriteOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteOffer
        fields = ['id', 'candidate', 'offer', 'added_at']