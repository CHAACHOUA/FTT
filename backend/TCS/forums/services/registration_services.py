from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from forums.models import Forum, ForumRegistration
from forums.serializers import ForumRegistrationSerializer
from candidates.models import Candidate





def register_candidate_to_forum(user, forum_id):
    """
    Inscrit un candidat à un forum donné.
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        candidate = get_object_or_404(Candidate, user=user)

        if ForumRegistration.objects.filter(forum=forum, candidate=candidate).exists():
            return Response({"detail": "Vous êtes déjà inscrit à ce forum."}, status=status.HTTP_400_BAD_REQUEST)

        registration = ForumRegistration.objects.create(forum=forum, candidate=candidate)
        serializer = ForumRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response(
            {"detail": "Erreur d'intégrité : peut-être une double inscription."},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {"detail": f"Erreur lors de l'inscription au forum: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
