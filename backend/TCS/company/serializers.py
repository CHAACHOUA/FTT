from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class CompanyWithRecruitersSerializer(serializers.ModelSerializer):
    recruiters = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = ['name', 'logo', 'recruiters']
    def get_recruiters(self, obj):
        from recruiters.serializers import RecruiterSerializer
        forum = self.context.get('forum')
        if not forum:
            return []

        return RecruiterSerializer(
            obj.recruiters.filter(forum_participations__forum=forum),
            many=True
        ).data


