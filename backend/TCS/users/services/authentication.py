from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


def login_candidate_user(email: str, password: str):
    """
    Authentifie l'utilisateur avec l'email et le mot de passe fournis.
    Retourne les tokens JWT + infos de base si les identifiants sont valides.
    """
    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(email=email, password=password)

    if not user:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'email': user.email
    }, status=status.HTTP_200_OK)
