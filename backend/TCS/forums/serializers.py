from rest_framework import serializers
from .models import Forum, ForumRegistration, CandidateSearch
from organizers.serializers import OrganizerSerializer
from company.serializers import CompanyWithRecruitersSerializer


class ForumSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Forum
        fields = [
            'id',
            'name',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'type',
            'description',
            'organizer',
        ]


class ForumDetailSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    companies = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'id',
            'name',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'type',
            'description',
            'organizer',
            'companies',
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

class CandidateSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateSearch
        fields = '__all__'

class ForumRegistrationSerializer(serializers.ModelSerializer):
    search = CandidateSearchSerializer()

    class Meta:
        model = ForumRegistration
        fields = '__all__'
        read_only_fields = ['registered_at']

    def create(self, validated_data):
        search_data = validated_data.pop('search')
        search = CandidateSearch.objects.create(**search_data)
        return ForumRegistration.objects.create(search=search, **validated_data)

class ForumCandidateSerializer(serializers.ModelSerializer):
    candidate = serializers.SerializerMethodField()
    search = CandidateSearchSerializer(read_only=True)

    class Meta:
        model = ForumRegistration
        fields = ['candidate', 'search']

    def get_candidate(self, obj):
        from candidates.serializers import CandidateSerializer
        return CandidateSerializer(obj.candidate).data
