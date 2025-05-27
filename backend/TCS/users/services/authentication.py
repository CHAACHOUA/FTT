from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.models import Candidate
from users.models import User
from django.core.exceptions import ObjectDoesNotExist


def login_candidate_user(email: str, password: str):
    """
    Authentifie un utilisateur candidat avec validation du mot de passe.
    Gère les cas d'identifiants invalides, d'email introuvable, de compte inactif,
    et retourne les tokens JWT + infos.
    """
    # ✅ Vérifie que les champs sont fournis
    if not email or not password:
        return Response({
            "message": "Veuillez fournir un email et un mot de passe."
        }, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Vérifie si un compte existe avec cet email
    if not User.objects.filter(email=email).exists():
        return Response({
            "message": "Aucun compte trouvé avec cet email."
        }, status=status.HTTP_404_NOT_FOUND)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "message": "Identifiants incorrects. Veuillez réessayer."
        }, status=status.HTTP_401_UNAUTHORIZED)

    # ✅ Vérifie le mot de passe
    if not user.check_password(password):
        return Response({
            "message": "Identifiants incorrects. Veuillez réessayer."
        }, status=status.HTTP_401_UNAUTHORIZED)

    # ✅ Vérifie si le compte est activé
    if not user.is_active:
        return Response({
            "message": "Un e-mail de validation a déjà été envoyé à votre adresse. Veuillez vérifier votre boîte de réception ou cliquez ici pour le renvoyer.",
            "error": "User is inactive",
            "activation_resend_possible": True
        }, status=status.HTTP_403_FORBIDDEN)

    # ✅ Vérifie que le profil candidat existe
    try:
        candidate = Candidate.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({
            "message": "Profil candidat introuvable."
        }, status=status.HTTP_404_NOT_FOUND)

    # ✅ Génère les tokens JWT
    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Bienvenue à votre espace candidat",
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "role": user.role,
        "email": user.email,
        "name": candidate.first_name
    }, status=status.HTTP_200_OK)
