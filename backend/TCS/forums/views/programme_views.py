from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from forums.models import Forum, Programme, Speaker
from forums.serializers import ProgrammeSerializer, SpeakerSerializer
from organizers.models import Organizer


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def programme_list(request, forum_id):
    """
    Récupérer tous les programmes d'un forum
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        programmes = forum.programmes.all().order_by('start_date', 'start_time')
        serializer = ProgrammeSerializer(programmes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def programme_detail(request, forum_id, programme_id):
    """
    Récupérer les détails d'un programme spécifique
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        programme = forum.programmes.get(id=programme_id)
        serializer = ProgrammeSerializer(programme)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except (Forum.DoesNotExist, Programme.DoesNotExist):
        return Response({"error": "Forum ou programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_programme(request, forum_id):
    """
    Créer un nouveau programme pour un forum (réservé aux organisateurs)
    """
    try:
        # Vérifier que l'utilisateur est un organisateur
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        organizer = request.user.organizer_profile
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
        
        serializer = ProgrammeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(forum=forum)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé ou accès non autorisé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_programme(request, forum_id, programme_id):
    """
    Mettre à jour un programme (réservé aux organisateurs)
    """
    try:
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        organizer = request.user.organizer_profile
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
        programme = forum.programmes.get(id=programme_id)
        
        # Gérer les fichiers uploadés
        if request.FILES:
            request.data._mutable = True
            request.data['photo'] = request.FILES.get('photo')
        
        serializer = ProgrammeSerializer(programme, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except (Forum.DoesNotExist, Programme.DoesNotExist):
        return Response({"error": "Forum ou programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_programme(request, forum_id, programme_id):
    """
    Supprimer un programme (réservé aux organisateurs)
    """
    try:
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        organizer = request.user.organizer_profile
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
        programme = forum.programmes.get(id=programme_id)
        programme.delete()
        return Response({"message": "Programme supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
    except (Forum.DoesNotExist, Programme.DoesNotExist):
        return Response({"error": "Forum ou programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def speaker_list(request):
    """
    Récupérer tous les speakers
    """
    try:
        speakers = Speaker.objects.all().order_by('last_name', 'first_name')
        serializer = SpeakerSerializer(speakers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_speaker(request):
    """
    Créer un nouveau speaker (réservé aux organisateurs)
    """
    try:
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SpeakerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_speaker(request, speaker_id):
    """
    Mettre à jour un speaker (réservé aux organisateurs)
    """
    try:
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        speaker = Speaker.objects.get(id=speaker_id)
        serializer = SpeakerSerializer(speaker, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Speaker.DoesNotExist:
        return Response({"error": "Speaker non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_speaker(request, speaker_id):
    """
    Supprimer un speaker (réservé aux organisateurs)
    """
    try:
        if not hasattr(request.user, 'organizer_profile'):
            return Response({"error": "Accès réservé aux organisateurs"}, status=status.HTTP_403_FORBIDDEN)
        
        speaker = Speaker.objects.get(id=speaker_id)
        speaker.delete()
        return Response({"message": "Speaker supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
    except Speaker.DoesNotExist:
        return Response({"error": "Speaker non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 