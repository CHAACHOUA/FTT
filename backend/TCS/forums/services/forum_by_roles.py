from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from forums.models import Forum
from forums.serializers import ForumDetailSerializer
from candidates.models import Candidate

from recruiters.models import Recruiter

from organizers.models import Organizer


def get_candidate_forum_lists(user):
    """
    Retourne les forums où le candidat est inscrit et ceux où il ne l’est pas.
    """
    try:
        candidate = get_object_or_404(Candidate, user=user)

        registered = Forum.objects.filter(registrations__candidate=candidate).order_by('-start_date')
        unregistered = Forum.objects.exclude(registrations__candidate=candidate).order_by('-start_date')

        return Response({
            "registered": ForumDetailSerializer(registered, many=True).data,
            "unregistered": ForumDetailSerializer(unregistered, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": f"Erreur lors de la récupération des forums du candidat : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def get_recruiter_forum_lists(user):
    """
    Retourne les forums où le recruteur est inscrit et ceux où il ne l’est pas.
    """
    try:
        recruiter = get_object_or_404(Recruiter, user=user)

        registered = Forum.objects.filter(recruiter_participations__recruiter=recruiter).order_by('-start_date')
        unregistered = Forum.objects.exclude(recruiter_participations__recruiter=recruiter).order_by('-start_date')

        return Response({
            "registered": ForumDetailSerializer(registered, many=True).data,
            "unregistered": ForumDetailSerializer(unregistered, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": f"Erreur lors de la récupération des forums du recruteur : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_organizer_forum_lists(user):
    """
    Retourne les forums organisés par l'organisateur et ceux qu’il n’a pas organisés.
    """
    try:
        organizer = get_object_or_404(Organizer, user=user)

        organized = Forum.objects.filter(organizer=organizer).order_by('-start_date')
        not_organized = Forum.objects.exclude(organizer=organizer).order_by('-start_date')

        return Response({
            "organized": ForumDetailSerializer(organized, many=True).data,
            "not_organized": ForumDetailSerializer(not_organized, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": f"Erreur lors de la récupération des forums de l’organisateur : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
