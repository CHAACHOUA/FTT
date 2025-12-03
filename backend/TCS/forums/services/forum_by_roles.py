from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from datetime import datetime

from forums.models import Forum
from forums.serializers import ForumDetailSerializer
from candidates.models import Candidate

from recruiters.models import Recruiter

from organizers.models import Organizer


def filter_upcoming_forums(forums_queryset):
    """
    Filtre les forums pour ne garder que ceux en cours ou à venir, triés par date de fin croissante.
    """
    now = timezone.now()
    today = now.date()
    
    # Filtrer d'abord par date dans la base de données
    filtered_queryset = forums_queryset.filter(
        Q(end_date__gt=today) | Q(end_date=today)
    )
    
    # Filtrer en Python pour comparer correctement date+heure
    forums_list = []
    for forum in filtered_queryset:
        forum_end_datetime = timezone.make_aware(
            datetime.combine(forum.end_date, forum.end_time)
        )
        if forum_end_datetime >= now:
            forums_list.append(forum)
    
    # Trier par date de fin (croissant - les plus proches en premier)
    forums_list.sort(key=lambda f: (f.end_date, f.end_time))
    return forums_list


def get_candidate_forum_lists(user):
    """
    Retourne les forums où le candidat est inscrit et ceux où il ne l'est pas.
    Les forums non inscrits sont filtrés pour ne garder que ceux en cours ou à venir.
    """
    try:
        candidate = get_object_or_404(Candidate, user=user)

        registered = Forum.objects.filter(registrations__candidate=candidate).order_by('-end_date')
        unregistered_queryset = Forum.objects.exclude(registrations__candidate=candidate)
        
        # Filtrer les forums non inscrits pour ne garder que ceux en cours ou à venir
        unregistered = filter_upcoming_forums(unregistered_queryset)

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
    Retourne les forums où le recruteur est inscrit et ceux où il ne l'est pas.
    Les forums non inscrits sont filtrés pour ne garder que ceux en cours ou à venir.
    """
    try:
        recruiter = get_object_or_404(Recruiter, user=user)

        registered = Forum.objects.filter(recruiter_participations__recruiter=recruiter).order_by('-end_date')
        unregistered_queryset = Forum.objects.exclude(recruiter_participations__recruiter=recruiter)
        
        # Filtrer les forums non inscrits pour ne garder que ceux en cours ou à venir
        unregistered = filter_upcoming_forums(unregistered_queryset)

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
    Retourne les forums organisés par l'organisateur et ceux qu'il n'a pas organisés.
    Les forums non organisés sont filtrés pour ne garder que ceux en cours ou à venir.
    """
    try:
        organizer = get_object_or_404(Organizer, user=user)

        organized = Forum.objects.filter(organizer=organizer).order_by('-end_date')
        not_organized_queryset = Forum.objects.exclude(organizer=organizer)
        
        # Filtrer les forums non organisés pour ne garder que ceux en cours ou à venir
        not_organized = filter_upcoming_forums(not_organized_queryset)

        return Response({
            "organized": ForumDetailSerializer(organized, many=True).data,
            "not_organized": ForumDetailSerializer(not_organized, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": f"Erreur lors de la récupération des forums de l'organisateur : {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
