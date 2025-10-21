from rest_framework import serializers
from .models import Forum, ForumRegistration, CandidateSearch, Speaker, Programme
from organizers.serializers import OrganizerSerializer
from company.serializers import CompanyWithRecruitersSerializer


class SpeakerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Speaker
        fields = ['id', 'first_name', 'last_name', 'full_name', 'photo', 'position']


class ProgrammeSerializer(serializers.ModelSerializer):
    speakers = SpeakerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Programme
        fields = [
            'id',
            'title',
            'description',
            'photo',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'location',
            'speakers',
        ]


class ForumSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    programmes = ProgrammeSerializer(many=True, read_only=True)
    current_phase = serializers.SerializerMethodField()
    phase_display = serializers.SerializerMethodField()
    is_virtual = serializers.SerializerMethodField()

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
            'programmes',
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end',
            'current_phase',
            'phase_display',
            'is_virtual',
        ]
    
    def get_current_phase(self, obj):
        return obj.get_current_phase()
    
    def get_phase_display(self, obj):
        return obj.get_phase_display()
    
    def get_is_virtual(self, obj):
        return obj.is_virtual_forum()


class ForumDetailSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer(read_only=True)
    companies = serializers.SerializerMethodField()
    programmes = ProgrammeSerializer(many=True, read_only=True)
    current_phase = serializers.SerializerMethodField()
    phase_display = serializers.SerializerMethodField()
    is_virtual = serializers.SerializerMethodField()

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
            'programmes',
            'preparation_start',
            'preparation_end',
            'jobdating_start',
            'interview_start',
            'interview_end',
            'current_phase',
            'phase_display',
            'is_virtual',
        ]
    
    def get_current_phase(self, obj):
        return obj.get_current_phase()
    
    def get_phase_display(self, obj):
        return obj.get_phase_display()
    
    def get_is_virtual(self, obj):
        return obj.is_virtual_forum()

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
