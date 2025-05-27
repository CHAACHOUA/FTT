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
    Gère les erreurs internes, vérifie l'état du compte,
    et déclenche un email si l'adresse change.
    """
    if not user.is_active:
        return Response(
            {"error": "Votre compte n'est pas activé. Veuillez vérifier votre email."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        candidate = user.candidate_profile
    except AttributeError:
        return Response(
            {"error": "Profil candidat introuvable."},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        # 🔄 Mise à jour des sections
        update_base_info(candidate, data)
        update_skills(candidate, data)
        update_educations(candidate, data)
        update_experiences(candidate, data)
        update_languages(candidate, data)

        # 📧 Envoi du mail de validation si email modifié
        new_email = data.get('email')
        if new_email and new_email != user.email:
            try:
                send_user_token(user, "email_change", new_email)
                return Response({
                    'message': "Veuillez valider votre nouvelle adresse email. Un lien de confirmation a été envoyé."
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "error": "L'email n'a pas pu être envoyé. Veuillez réessayer plus tard.",
                    "detail": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ✅ Retour du profil mis à jour
        serializer = CandidateSerializer(candidate)
        return Response({
            'message': "Profil candidat mis à jour avec succès.",
            'profile': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la mise à jour du profil : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
