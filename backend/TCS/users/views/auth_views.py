from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from users.services.registration import register_new_candidate
from users.services.authentication import login_user_view
from users.services.account_activation import activate_user_account,resend_activation_link


@api_view(['POST'])
@permission_classes([AllowAny])
def register_candidate(request):
    """
    Enregistrement d’un candidat
    """
    return register_new_candidate(request)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")
    return login_user_view(email,password)


@api_view(['GET'])
@permission_classes([AllowAny])
def activate_account(request, token):
    """
    Activation de compte via token signé
    """
    return activate_user_account(token)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_activation(request):
    """
    Permet à un utilisateur de demander manuellement le renvoi du lien d’activation.
    """
    email = request.data.get('email')
    return resend_activation_link(email)