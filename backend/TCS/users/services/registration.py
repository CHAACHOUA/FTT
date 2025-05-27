from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.serializers import CandidateRegistrationSerializer


from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.serializers import CandidateRegistrationSerializer
from django.db import IntegrityError
from django.core.exceptions import ValidationError

from users.utils import send_user_token


def register_new_candidate(request):
    """
    Gère l'enregistrement d'un nouveau candidat :
    - Valide les données
    - Crée l'utilisateur et le candidat
    - Envoie l'email d'activation
    - Retourne les tokens JWT
    """
    serializer = CandidateRegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "message": "Erreur de validation.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        candidate = serializer.save()
        user = candidate.user

        try:
            send_user_token(user, "activation")
        except Exception as e:
            print(f"Erreur d'envoi de mail : {e}")
            user.delete()
            candidate.delete()
            return Response({
                "message": "Erreur lors de l'envoi de l'email d'activation. Réessayez."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Inscription réussie. Vérifiez votre email pour activer votre compte.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email
        }, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response({
            "message": "Un utilisateur avec cet email existe déjà."
        }, status=status.HTTP_409_CONFLICT)

    except ValidationError as e:
        return Response({
            "message": "Erreur de validation lors de la création.",
            "details": e.message_dict
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("Erreur lors de l'inscription :", e)
        return Response({
            "message": "Erreur inattendue lors de l'inscription.",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
