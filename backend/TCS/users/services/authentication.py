from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

def login_candidate_user(email: str, password: str):
    """
    Authentifie l'utilisateur avec l'email et le mot de passe fournis.
    Gère aussi le cas d'un compte inactif (user.is_active=False).
    Retourne les tokens JWT + infos si tout est OK.
    """
    if not email or not password:
        return Response({
            'message': 'Veuillez fournir un email et un mot de passe.'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(email=email, password=password)

    if not user:
        return Response({
            'message': 'Identifiants incorrects. Veuillez réessayer.'
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
            'message': 'Un e-mail de validation a déjà été envoyé à votre adresse. Veuillez vérifier votre boîte de réception ou cliquez ici pour le renvoyer',
             'error': 'User is inactive',
             'activation_resend_possible':True
        }, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Bienvenue à votre espace candidat ',
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'email': user.email
    }, status=status.HTTP_200_OK)
