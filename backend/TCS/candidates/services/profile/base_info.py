from rest_framework.response import Response
from rest_framework import status
from candidates.serializers import CandidateSerializer


def update_base_info(candidate, data):
    """
    Met à jour les infos de base du candidat (nom, titre, contact...).
    """
    candidate.first_name = data.get('first_name', candidate.first_name)
    candidate.last_name = data.get('last_name', candidate.last_name)
    candidate.phone = data.get('phone', candidate.phone)
    candidate.title = data.get('title', candidate.title)
    candidate.linkedin = data.get('linkedin', candidate.linkedin)
    candidate.education_level = data.get('education_level', candidate.education_level)
    candidate.preferred_contract_type = data.get('preferred_contract_type', candidate.preferred_contract_type)
    candidate.bio = data.get('bio', candidate.bio)
    candidate.profile_picture = data.get('profile_picture', candidate.profile_picture)

    candidate.save()


def get_candidate_profile(user):
    """
    Retourne le profil complet du candidat connecté.
    """
    try:
        candidate = user.candidate_profile
    except AttributeError:
        return Response({"detail": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CandidateSerializer(candidate)
    return Response(serializer.data, status=status.HTTP_200_OK)
