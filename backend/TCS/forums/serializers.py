from rest_framework import serializers
from .models import Forum, ForumRegistration
from organizers.serializers import OrganizerSerializer

from company.models import ForumCompany
from company.serializers import CompanyWithRecruitersSerializer


class ForumSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Forum
        fields = '__all__'


class ForumDetailSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    companies = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'name',
            'photo',
            'date',
            'type',
            'description',
            'organizer',
            'companies',  # 👈 nouvelle clé avec companies + leurs recruteurs
        ]

    def get_companies(self, obj):
        forum = obj
        forum_companies = forum.company_participants.all()  # ForumCompany queryset
        companies = [fc.company for fc in forum_companies]

        return CompanyWithRecruitersSerializer(
            companies,
            many=True,
            context={'forum': forum}
        ).data
class ForumRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumRegistration
        fields = '__all__'
        read_only_fields = ['registered_at']