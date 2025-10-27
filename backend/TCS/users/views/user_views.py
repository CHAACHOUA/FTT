from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserTimezoneSerializer, UserProfileSerializer
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
    
    print(f"🔍 [BACKEND] Récupération du profil utilisateur: {user.email}")
    print(f"🔍 [BACKEND] Fuseau horaire actuel: {user.timezone}")
    print(f"🔍 [BACKEND] Données renvoyées au frontend: timezone={user.timezone}")
    
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
            "timezone": user.timezone,
            "is_active": user.is_active
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "message": "Erreur lors de la récupération du profil"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_timezone(request):
    """
    Met à jour le fuseau horaire de l'utilisateur
    """
    print(f"🔄 [BACKEND] Changement de fuseau horaire pour l'utilisateur {request.user.email}")
    print(f"🔄 [BACKEND] Ancien fuseau horaire: {request.user.timezone}")
    print(f"🔄 [BACKEND] Nouveau fuseau horaire demandé: {request.data.get('timezone')}")
    
    serializer = UserTimezoneSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        print(f"✅ [BACKEND] Fuseau horaire mis à jour avec succès: {serializer.data['timezone']}")
        return Response({
            "message": "Fuseau horaire mis à jour avec succès",
            "timezone": serializer.data['timezone']
        }, status=status.HTTP_200_OK)
    
    print(f"❌ [BACKEND] Erreur de validation: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Récupère le profil complet de l'utilisateur
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_timezones(request):
    """
    Récupère la liste des fuseaux horaires disponibles
    """
    from virtual.utils.timezone_utils import get_available_timezones
    
    timezones = get_available_timezones()
    return Response({
        "timezones": timezones
    }, status=status.HTTP_200_OK)
