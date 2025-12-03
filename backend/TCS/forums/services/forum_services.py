from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from datetime import datetime
from forums.models import Forum , ForumRegistration
from forums.serializers import ForumSerializer, ForumDetailSerializer


def get_all_forums():
    """
    Retourne la liste de tous les forums en cours ou à venir, triés par date de fin croissante (les plus proches en premier).
    """
    try:
        now = timezone.now()
        today = now.date()
        
        # Filtrer les forums qui sont en cours ou à venir
        # Un forum est considéré comme en cours/à venir si sa date de fin est dans le futur
        # ou si elle est aujourd'hui mais l'heure de fin n'est pas encore passée
        forums_queryset = Forum.objects.filter(
            Q(end_date__gt=today) |  # Date de fin dans le futur
            Q(end_date=today)  # Date de fin aujourd'hui (on filtrera par heure en Python)
        )
        
        # Filtrer en Python pour les forums qui se terminent aujourd'hui
        # pour comparer correctement la date+heure complète
        forums_list = []
        for forum in forums_queryset:
            # Créer une datetime complète pour la fin du forum
            forum_end_datetime = timezone.make_aware(
                datetime.combine(forum.end_date, forum.end_time)
            )
            # Si la fin du forum est dans le futur, l'inclure
            if forum_end_datetime >= now:
                forums_list.append(forum)
        
        # Trier par date de fin (croissant - les plus proches en premier)
        forums_list.sort(key=lambda f: (f.end_date, f.end_time))
        
        serializer = ForumDetailSerializer(forums_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": f"Erreur lors de la récupération des forums: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def get_forum_detail(pk):
    """
    Retourne les détails d’un forum donné par son ID.
    """
    try:
        forum = get_object_or_404(Forum, pk=pk)
        serializer = ForumDetailSerializer(forum)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Forum.DoesNotExist:
        return Response(
            {"detail": "Forum non trouvé."},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {"detail": f"Erreur serveur : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_candidate_search_by_forum_and_candidate(forum_id, candidate):
    """
    Récupère l'objet CandidateSearch lié à une inscription à un forum.
    """
    try:
        registration = ForumRegistration.objects.select_related('search').get(
            forum_id=forum_id,
            candidate=candidate
        )
        if registration.search:
            return registration.search
        return None
    except ForumRegistration.DoesNotExist:
        return Response(
            {"detail": "Inscription au forum introuvable."},
            status=status.HTTP_404_NOT_FOUND
        )