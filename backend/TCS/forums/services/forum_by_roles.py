from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from forums.models import Forum
from forums.serializers import ForumSerializer
from candidates.models import Candidate


def get_candidate_forum_lists(user):
    """
    Retourne les forums où le candidat est inscrit et ceux où il ne l’est pas.
    """
    try:
        candidate = get_object_or_404(Candidate, user=user)

        registered = Forum.objects.filter(registrations__candidate=candidate).order_by('-date')
        unregistered = Forum.objects.exclude(registrations__candidate=candidate).order_by('-date')

        return Response({
            "registered": ForumSerializer(registered, many=True).data,
            "unregistered": ForumSerializer(unregistered, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": f"Erreur lors de la récupération des forums du candidat : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
