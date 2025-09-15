from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from candidates.models import Candidate
from recruiters.models import Recruiter
from organizers.models import Organizer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Récupère les informations de l'utilisateur connecté
    """
    user = request.user
    
    try:
        if user.role == 'candidate':
            profile = Candidate.objects.get(user=user)
            name = profile.first_name
        elif user.role == 'recruiter':
            profile = Recruiter.objects.get(user=user)
            name = profile.first_name
        elif user.role == 'organizer':
            profile = Organizer.objects.get(user=user)
            name = profile.name
        else:
            name = "Admin"
            
        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": name,
            "is_active": user.is_active
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "message": "Erreur lors de la récupération du profil"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
