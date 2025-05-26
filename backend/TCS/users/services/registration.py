from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.serializers import CandidateRegistrationSerializer


def register_new_candidate(request):
    """
    Gère l'enregistrement d'un nouveau candidat :
    - valide les données reçues via le serializer
    - crée l'objet Candidate et son User lié
    - retourne un JWT (refresh + access) en cas de succès
    """
    serializer = CandidateRegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    candidate = serializer.save()
    user = candidate.user
    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Candidate registered successfully.",
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "role": user.role,
        "email": user.email
    }, status=status.HTTP_201_CREATED)
