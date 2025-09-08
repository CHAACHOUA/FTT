from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from forums.models import Forum, ForumRegistration, CandidateSearch
from forums.serializers import ForumRegistrationSerializer
from candidates.models import Candidate
from company.models import Company, ForumCompany
from recruiters.models import Recruiter, RecruiterForumParticipation


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


def register_recruiter_to_forum(user, forum_id, data=None):
    """
    Inscrit un recruteur à un forum en ajoutant son entreprise au forum avec approved=False
    et le recruteur lui-même via RecruiterForumParticipation.
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer le profil recruteur de l'utilisateur
        try:
            recruiter = Recruiter.objects.get(user=user)
        except Recruiter.DoesNotExist:
            return Response(
                {"detail": "Profil recruteur non trouvé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer l'entreprise du recruteur
        company = recruiter.company
        
        # Vérifier si l'entreprise est déjà inscrite au forum
        forum_company, company_created = ForumCompany.objects.get_or_create(
            company=company,
            forum=forum,
            defaults={'approved': True}  # Directement approuvé par défaut
        )
        
        # Vérifier si le recruteur est déjà inscrit au forum
        if RecruiterForumParticipation.objects.filter(recruiter=recruiter, forum=forum).exists():
            return Response(
                {"detail": "Vous êtes déjà inscrit à ce forum."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ajouter le recruteur au forum
        recruiter_participation = RecruiterForumParticipation.objects.create(
            recruiter=recruiter,
            forum=forum
        )
        
        return Response({
            "detail": "Inscription réussie ! Votre entreprise a été ajoutée au forum et est directement approuvée.",
            "company_id": company.id,
            "forum_id": forum.id,
            "recruiter_id": recruiter.id,
            "approved": forum_company.approved
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {"detail": f"Erreur lors de l'inscription : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {"detail": f"Erreur inattendue : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
