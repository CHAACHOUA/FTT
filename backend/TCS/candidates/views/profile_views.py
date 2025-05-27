import json

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from candidates.services.profile.base_info import get_candidate_profile
from candidates.services.profile.complete_profile import complete_candidate_profile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_profile_view(request):
    """
    POST : Complétion du profil du candidat connecté.
    """

    user = request.user
    candidate = getattr(user, 'candidate_profile', None)

    if candidate is None:
        return Response({'detail': 'Profil candidat introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    if 'profile_picture' in request.FILES:
        data['profile_picture'] = request.FILES['profile_picture']
    for field in ['skills', 'experiences', 'educations', 'candidate_languages']:
        raw = data.get(field)
        if raw and isinstance(raw, str):
            try:
                data[field] = json.loads(raw)
            except json.JSONDecodeError:
                data[field] = []




    return  complete_candidate_profile(user, data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_profile_view(request):
    return get_candidate_profile(request.user)