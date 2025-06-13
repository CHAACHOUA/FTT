from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from candidates.services.public_profile import get_candidate_by_token
from candidates.serializers import CandidateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_token(request):
    user = request.user
    if hasattr(user, 'candidate_profile'):
        return Response({
            "public_token": str(user.candidate_profile.public_token)
        })
    return Response({"detail": "Profil candidat non trouvé."}, status=404)
@api_view(['GET'])
@permission_classes([AllowAny])
def public_candidate_view(request, token):
    try:
        candidate = get_candidate_by_token(token)
        serializer = CandidateSerializer(candidate)
        return Response(serializer.data)
    except ObjectDoesNotExist:
        return Response({'detail': 'Candidat introuvable.'}, status=status.HTTP_404_NOT_FOUND)
