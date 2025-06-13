from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from forums.models import Forum , ForumRegistration
from forums.serializers import ForumSerializer, ForumDetailSerializer


def get_all_forums():
    """
    Retourne la liste de tous les forums, triés par date décroissante.
    """
    try:
        forums = Forum.objects.all().order_by('-date')
        serializer = ForumDetailSerializer(forums, many=True)
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