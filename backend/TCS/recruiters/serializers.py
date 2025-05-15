from rest_framework import serializers

from company.serializers import CompanySerializer
from .models import Recruiter
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



