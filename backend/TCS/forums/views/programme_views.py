from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.db import transaction
from forums.models import Forum, Programme, Speaker, ProgrammeRegistration
from forums.serializers import ProgrammeSerializer, SpeakerSerializer
from organizers.models import Organizer
from virtual.services.zoom_service import ZoomService
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def programme_list(request, forum_id):
    """
    Récupérer tous les programmes d'un forum
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        programmes = forum.programmes.all().prefetch_related('speakers').order_by('start_date', 'start_time')
        serializer = ProgrammeSerializer(programmes, many=True, context={'request': request})
        print(f"🔍 [BACKEND] programme_list - programmes avec speakers: {[p.speakers.all() for p in programmes]}")
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
        programme = forum.programmes.prefetch_related('speakers').get(id=programme_id)
        serializer = ProgrammeSerializer(programme, context={'request': request})
        print(f"🔍 [BACKEND] programme_detail - programme speakers: {programme.speakers.all()}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except (Forum.DoesNotExist, Programme.DoesNotExist):
        return Response({"error": "Forum ou programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_programme(request, forum_id):
    """
    Créer un nouveau programme pour un forum
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        
        # Vérifier que l'utilisateur est l'organizer du forum
        if not hasattr(request.user, 'organizer_profile') or request.user.organizer_profile != forum.organizer:
            return Response({"error": "Vous n'êtes pas autorisé à créer un programme pour ce forum"}, status=status.HTTP_403_FORBIDDEN)
        
        enable_zoom = request.data.get('enable_zoom', False)
        
        serializer = ProgrammeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                programme = serializer.save(forum=forum)
                
                # Gérer les speakers
                speaker_ids = request.data.getlist('speakers')
                print(f"🔍 [BACKEND] create_programme - speaker_ids reçus: {speaker_ids}")
                if speaker_ids:
                    programme.speakers.set(speaker_ids)
                    print(f"🔍 [BACKEND] create_programme - speakers associés: {programme.speakers.all()}")
                
                # Créer le lien Zoom si demandé
                if enable_zoom and not programme.meeting_link:
                    try:
                        logger.info(f"🔗 Creating Zoom meeting for programme {programme.id}")
                        zoom_service = ZoomService()
                        meeting_info = zoom_service.create_meeting_for_programme(programme)
                        programme.meeting_link = meeting_info['meeting_link']
                        programme.save()
                        logger.info(f"✅ Zoom meeting created successfully for programme {programme.id}")
                    except Exception as e:
                        logger.error(f"❌ Failed to create Zoom meeting: {str(e)}")
                        # Ne pas bloquer la création du programme si Zoom échoue
                        # Le lien pourra être créé manuellement plus tard
            
            # Recharger le serializer avec le contexte pour la réponse
            response_serializer = ProgrammeSerializer(programme, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé ou accès non autorisé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_programme(request, forum_id, programme_id):
    """
    Mettre à jour un programme existant
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        programme = forum.programmes.get(id=programme_id)
        
        # Vérifier que l'utilisateur est l'organizer du forum
        if not hasattr(request.user, 'organizer_profile') or request.user.organizer_profile != forum.organizer:
            return Response({"error": "Vous n'êtes pas autorisé à modifier ce programme"}, status=status.HTTP_403_FORBIDDEN)
        
        enable_zoom = request.data.get('enable_zoom', False)
        
        serializer = ProgrammeSerializer(programme, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                programme = serializer.save()
                
                # Gérer les speakers
                if 'speakers' in request.data:
                    speaker_ids = request.data.getlist('speakers')
                    programme.speakers.set(speaker_ids)
                
                # Créer le lien Zoom si demandé et qu'il n'existe pas
                if enable_zoom and not programme.meeting_link:
                    try:
                        logger.info(f"🔗 Creating Zoom meeting for programme {programme.id}")
                        zoom_service = ZoomService()
                        meeting_info = zoom_service.create_meeting_for_programme(programme)
                        programme.meeting_link = meeting_info['meeting_link']
                        programme.save()
                        logger.info(f"✅ Zoom meeting created successfully for programme {programme.id}")
                    except Exception as e:
                        logger.error(f"❌ Failed to create Zoom meeting: {str(e)}")
            
            response_serializer = ProgrammeSerializer(programme, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Programme.DoesNotExist:
        return Response({"error": "Programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_programme(request, forum_id, programme_id):
    """
    Supprimer un programme
    """
    try:
        forum = Forum.objects.get(id=forum_id)
        programme = forum.programmes.get(id=programme_id)
        
        # Vérifier que l'utilisateur est l'organizer du forum
        if not hasattr(request.user, 'organizer_profile') or request.user.organizer_profile != forum.organizer:
            return Response({"error": "Vous n'êtes pas autorisé à supprimer ce programme"}, status=status.HTTP_403_FORBIDDEN)
        
        programme.delete()
        return Response({"message": "Programme supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Programme.DoesNotExist:
        return Response({"error": "Programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def speaker_list(request):
    """
    Récupérer tous les speakers
    """
    try:
        speakers = Speaker.objects.all()
        serializer = SpeakerSerializer(speakers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_speaker(request):
    """
    Créer un nouveau speaker
    """
    try:
        serializer = SpeakerSerializer(data=request.data)
        if serializer.is_valid():
            speaker = serializer.save()
            return Response(SpeakerSerializer(speaker).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_speaker(request, speaker_id):
    """
    Mettre à jour un speaker existant
    """
    try:
        speaker = Speaker.objects.get(id=speaker_id)
        serializer = SpeakerSerializer(speaker, data=request.data, partial=True)
        if serializer.is_valid():
            speaker = serializer.save()
            return Response(SpeakerSerializer(speaker).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Speaker.DoesNotExist:
        return Response({"error": "Speaker non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_speaker(request, speaker_id):
    """
    Supprimer un speaker
    """
    try:
        speaker = Speaker.objects.get(id=speaker_id)
        speaker.delete()
        return Response({"message": "Speaker supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
    except Speaker.DoesNotExist:
        return Response({"error": "Speaker non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def programme_register(request, forum_id, programme_id):
    """
    S'inscrire à un programme (candidats uniquement)
    """
    try:
        if not hasattr(request.user, 'candidate_profile'):
            return Response(
                {"error": "Seuls les candidats peuvent s'inscrire à un programme"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        forum = Forum.objects.get(id=forum_id)
        programme = forum.programmes.get(id=programme_id)
        candidate = request.user.candidate_profile
        
        # Vérifier si déjà inscrit
        registration, created = ProgrammeRegistration.objects.get_or_create(
            programme=programme,
            candidate=candidate
        )
        
        if created:
            logger.info(f"✅ Candidat {candidate.user.email} inscrit au programme {programme.id}")
            return Response(
                {"message": "Inscription réussie", "is_registered": True},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"message": "Vous êtes déjà inscrit à ce programme", "is_registered": True},
                status=status.HTTP_200_OK
            )
            
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Programme.DoesNotExist:
        return Response({"error": "Programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'inscription: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def programme_unregister(request, forum_id, programme_id):
    """
    Se désinscrire d'un programme (candidats uniquement)
    """
    try:
        if not hasattr(request.user, 'candidate_profile'):
            return Response(
                {"error": "Seuls les candidats peuvent se désinscrire d'un programme"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        forum = Forum.objects.get(id=forum_id)
        programme = forum.programmes.get(id=programme_id)
        candidate = request.user.candidate_profile
        
        try:
            registration = ProgrammeRegistration.objects.get(
                programme=programme,
                candidate=candidate
            )
            registration.delete()
            logger.info(f"✅ Candidat {candidate.user.email} désinscrit du programme {programme.id}")
            return Response(
                {"message": "Désinscription réussie", "is_registered": False},
                status=status.HTTP_200_OK
            )
        except ProgrammeRegistration.DoesNotExist:
            return Response(
                {"error": "Vous n'êtes pas inscrit à ce programme"},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Programme.DoesNotExist:
        return Response({"error": "Programme non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"❌ Erreur lors de la désinscription: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
