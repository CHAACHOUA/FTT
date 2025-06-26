from rest_framework import serializers
from .models import Company
from recruiters.models import Offer




class CompanySerializer(serializers.ModelSerializer):
    sectors = serializers.JSONField()

    class Meta:
        model = Company
        fields = '__all__'

class CompanyWithRecruitersSerializer(serializers.ModelSerializer):
    recruiters = serializers.SerializerMethodField()
    offers = serializers.SerializerMethodField()
    stand = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['name', 'logo','sectors', 'recruiters', 'offers', 'stand']

    def get_recruiters(self, obj):
        from recruiters.serializers import RecruiterSerializer
        forum = self.context.get('forum')
        if not forum:
            return []
        return RecruiterSerializer(
            obj.recruiters.filter(forum_participations__forum=forum),
            many=True
        ).data

    def get_offers(self, obj):
        from recruiters.serializers import OfferSerializer
        forum = self.context.get('forum')
        if not forum:
            return []
        offers = Offer.objects.filter(company=obj, forum=forum)
        return OfferSerializer(offers, many=True).data

    def get_stand(self, obj):
        forum = self.context.get('forum')
        if not forum:
            return None
        forum_company = obj.forum_participations.filter(forum=forum).first()
        return forum_company.stand if forum_company else None


