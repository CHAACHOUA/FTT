from rest_framework.response import Response
from rest_framework import status

from .base_info import update_base_info
from .skill import update_skills
from .education import update_educations
from .experience import update_experiences
from .language import update_languages
from users.utils import send_user_token
from candidates.serializers import CandidateSerializer


def complete_candidate_profile(user, data):
    """
    Met à jour l'ensemble du profil candidat de manière modulaire.
    - Vérifie l'état du compte
    - Met à jour toutes les sections
    - Déclenche un email si changement d'adresse
    """
    if not user.is_active:
        return Response(
            {"error": "Your account is not activated. Please check your email."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        candidate = user.candidate_profile
    except AttributeError:
        return Response(
            {"error": "Candidate profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # 🧩 Mise à jour des sections du profil
    update_base_info(candidate, data)
    update_skills(candidate, data)
    update_educations(candidate, data)
    update_experiences(candidate, data)
    update_languages(candidate, data)

    # 📧 Si l'email a changé, envoyer un lien de validation
    new_email = data.get('email')
    if new_email and new_email != user.email:
        send_user_token(user, "email_change", new_email)
        return Response({
            'message': 'Please verify your new email. A validation link has been sent.'
        }, status=status.HTTP_200_OK)

    # ✅ Retour du profil mis à jour
    serializer = CandidateSerializer(candidate)
    return Response({
        'message': 'Candidate profile completed and saved.',
        'profile': serializer.data
    }, status=status.HTTP_200_OK)
