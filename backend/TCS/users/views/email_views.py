from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from users.services.email import validate_email_change_token


@api_view(['GET'])
@permission_classes([AllowAny])
def validate_email_change(request, token_str):
    """
    Vérifie et applique un changement d'email via un lien signé.
    """
    return validate_email_change_token(token_str)
