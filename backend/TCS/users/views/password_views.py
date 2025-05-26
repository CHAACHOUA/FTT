from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.services.password import (
    request_password_reset_service,
    reset_user_password,
    change_user_password
)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Envoie un lien de réinitialisation à l’email donné (si enregistré).
    """
    return request_password_reset_service(request)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, token):
    """
    Réinitialise le mot de passe via un token signé.
    """
    return reset_user_password(request, token)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change le mot de passe d’un utilisateur connecté.
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    return change_user_password(user, old_password, new_password)
