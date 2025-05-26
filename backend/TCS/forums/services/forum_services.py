from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from forums.models import Forum
from forums.serializers import ForumSerializer, ForumDetailSerializer


def get_all_forums():
    """
    Retourne la liste de tous les forums, triés par date décroissante.
    """
    try:
        forums = Forum.objects.all().order_by('-date')
        serializer = ForumSerializer(forums, many=True)
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
