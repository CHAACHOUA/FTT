from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.services.registration import register_new_candidate
from users.services.authentication import login_user_view
from users.services.account_activation import activate_user_account,resend_activation_link
from users.services.recruiter_invitation import send_recruiter_invitation, complete_recruiter_registration


@api_view(['POST'])
@permission_classes([AllowAny])
def register_candidate(request):
    """
    Enregistrement d'un candidat
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
    Permet à un utilisateur de demander manuellement le renvoi du lien d'activation.
    """
    email = request.data.get('email')
    return resend_activation_link(email)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_recruiter(request):
    """
    Envoie un lien d'invitation à un recruteur (réservé aux organizers, admins et recruiters)
    """
    return send_recruiter_invitation(request)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])  # Désactive l'authentification pour cet endpoint
def complete_recruiter_setup(request, token):
    """
    Permet au recruteur de finaliser son inscription avec mot de passe
    """
    print(f"🔧 [BACKEND] Vue complete_recruiter_setup appelée")
    print(f"🔧 [BACKEND] Token reçu: {token[:20]}...")
    print(f"🔧 [BACKEND] Méthode: {request.method}")
    print(f"🔧 [BACKEND] User: {request.user}")
    print(f"🔧 [BACKEND] Authentifié: {request.user.is_authenticated}")
    return complete_recruiter_registration(request, token)