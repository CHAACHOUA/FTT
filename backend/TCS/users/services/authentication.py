
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.models import Candidate
from users.models import User
from django.core.exceptions import ObjectDoesNotExist
from recruiters.models import Recruiter





def login_user_view(email: str, password: str):

    if not email or not password:
        return Response({"message": "Veuillez fournir un email et un mot de passe."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Aucun compte trouvé avec cet email."},
                        status=status.HTTP_404_NOT_FOUND)

    if not user.is_active:
        return Response({
            "message": "Un e-mail de validation a déjà été envoyé. Veuillez vérifier votre boîte de réception.",
            "error": "User is inactive",
            "activation_resend_possible": True
        }, status=status.HTTP_403_FORBIDDEN)

    if user.role == "candidate":
        return login_candidate_user(email, password)
    elif user.role == "recruiter":
        return login_recruiter_user(email, password)
    else:
        return Response({"message": "Rôle utilisateur non supporté."},
                        status=status.HTTP_403_FORBIDDEN)


def login_candidate_user(email: str, password: str):


    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Aucun compte trouvé avec cet email."},
                        status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({"message": "Identifiants incorrects. Veuillez réessayer."},
                        status=status.HTTP_401_UNAUTHORIZED)


    try:
        candidate = Candidate.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({"message": "Profil candidat introuvable."},
                        status=status.HTTP_404_NOT_FOUND)

    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email

    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "name": candidate.first_name
    }, status=status.HTTP_200_OK)

def login_recruiter_user(email: str, password: str):

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Aucun compte trouvé avec cet email."},
                        status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({"message": "Identifiants incorrects. Veuillez réessayer."},
                        status=status.HTTP_401_UNAUTHORIZED)

    try:
        recruiter = Recruiter.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({"message": "Profil recruteur introuvable."},
                        status=status.HTTP_404_NOT_FOUND)

    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email

    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "name": recruiter.first_name
    }, status=status.HTTP_200_OK)
