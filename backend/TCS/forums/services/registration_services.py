from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from forums.models import Forum, ForumRegistration, CandidateSearch
from forums.serializers import ForumRegistrationSerializer
from candidates.models import Candidate


def register_candidate_to_forum(user, forum_id, data=None):
    """
    Inscrit un candidat à un forum donné avec enregistrement de ses préférences de recherche,
    en stockant la recherche dans un modèle lié par clé étrangère dans ForumRegistration.
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        candidate = get_object_or_404(Candidate, user=user)

        if ForumRegistration.objects.filter(forum=forum, candidate=candidate).exists():
            return Response(
                {"detail": "Vous êtes déjà inscrit à ce forum."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Création de l'objet de recherche
        search_instance = None
        if data:
            search_instance = CandidateSearch.objects.create(
                contract_type=data.get("contract_type", ""),
                sector=data.get("sector", ""),
                experience=data.get("experience") or 0,
                region=data.get("region", ""),
                rqth=data.get("rqth", False),
            )

        # Création de l'enregistrement avec lien vers search
        registration = ForumRegistration.objects.create(
            forum=forum,
            candidate=candidate,
            search=search_instance
        )

        serializer = ForumRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response(
            {"detail": "Erreur d'intégrité : inscription déjà existante."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"detail": f"Erreur inattendue : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
