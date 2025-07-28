from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from organizers.services.profile_service import get_organizer_profile, update_organizer_profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_profile_view(request):
    """Récupère le profil de l'organizer connecté"""
    return get_organizer_profile(request.user)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_organizer_profile_view(request):
    """Met à jour le profil de l'organizer connecté"""
    result = update_organizer_profile(
        user=request.user,
        data=request.data,
        logo=request.FILES.get('logo')
    )
    
    return Response(result["data"], status=result["status"]) 