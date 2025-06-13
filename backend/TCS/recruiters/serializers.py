from rest_framework import serializers

from company.serializers import CompanySerializer
from .models import Recruiter, Offer, FavoriteOffer
from forums.serializers import ForumSerializer


class RecruiterSerializer(serializers.ModelSerializer):
    company= CompanySerializer( read_only=True)
    class Meta:
        model = Recruiter
        fields = ['first_name', 'last_name','photo', 'company']

class RecruiterForumParticipationSerializer(serializers.ModelSerializer):
    forum = ForumSerializer(read_only=True)

    class Meta:
        model = Recruiter
        fields = ['forum']


class OfferSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
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
            'created_at',
            'company_name',
            'recruiter_name',
        ]

    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}"
class FavoriteOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteOffer
        fields = ['id', 'candidate', 'offer', 'added_at']