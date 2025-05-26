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


def register_new_candidate(request):
    """
    Gère l'enregistrement d'un nouveau candidat :
    - valide les données via le serializer
    - crée le candidat et l'utilisateur associé
    - retourne les tokens JWT si tout est bon
    - gère les erreurs fréquentes avec messages explicites
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
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Inscription réussie.",
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
        return Response({
            "message": "Erreur inattendue lors de l'inscription.",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
