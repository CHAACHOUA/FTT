from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db import models

from virtual.models import VirtualAgendaSlot
from virtual.services.zoom_service import ZoomService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_zoom_meeting(request, forum_id, slot_id):
    """
    Créer une réunion Zoom pour un créneau validé
    """
    try:
        # Récupérer le créneau
        slot = get_object_or_404(
            VirtualAgendaSlot,
            id=slot_id,
            forum_id=forum_id,
            recruiter=request.user
        )
        
        # Vérifier que le créneau est réservé (candidat accepté)
        if slot.status != 'booked':
            return Response({
                'error': 'Le créneau doit être réservé pour créer une réunion Zoom'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que c'est un créneau vidéo
        if slot.type != 'video':
            return Response({
                'error': 'Seuls les créneaux vidéo peuvent avoir une réunion Zoom'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier qu'il n'y a pas déjà un lien
        if slot.meeting_link:
            return Response({
                'error': 'Une réunion existe déjà pour ce créneau',
                'meeting_link': slot.meeting_link
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le service Zoom
        zoom_service = ZoomService()
        
        # Créer la réunion Zoom
        with transaction.atomic():
            meeting_info = zoom_service.create_meeting(slot)
            slot.meeting_link = meeting_info['meeting_link']
            slot.save()
        
        return Response({
            'success': True,
            'message': 'Réunion Zoom créée avec succès',
            'meeting_info': meeting_info
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la création de la réunion Zoom',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_zoom_meeting_info(request, forum_id, slot_id):
    """
    Récupérer les informations d'une réunion Zoom
    """
    try:
        # Récupérer le créneau
        slot = get_object_or_404(
            VirtualAgendaSlot,
            id=slot_id,
            forum_id=forum_id
        )
        
        # Vérifier l'accès à la réunion
        if not slot.meeting_link:
            return Response({
                'error': 'Aucune réunion Zoom disponible pour ce créneau'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extraire l'ID de réunion depuis le lien
        meeting_id = slot.meeting_link.split('/')[-1].split('?')[0]
        
        # Créer le service Zoom
        zoom_service = ZoomService()
        
        # Récupérer les informations de la réunion
        meeting_info = zoom_service.get_meeting_info(meeting_id)
        
        response_data = {
            'slot_id': slot.id,
            'meeting_link': slot.meeting_link,
            'meeting_id': meeting_id,
            'participants': zoom_service.get_meeting_participants_info(slot),
            'slot_info': {
                'date': slot.date.isoformat(),
                'start_time': slot.start_time.isoformat(),
                'end_time': slot.end_time.isoformat(),
                'duration': slot.duration,
                'description': slot.description,
                'status': slot.status
            },
            'forum_info': {
                'id': slot.forum.id,
                'name': slot.forum.name
            },
            'zoom_info': meeting_info
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des informations de réunion Zoom',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_zoom_meeting(request, forum_id, slot_id):
    """
    Supprimer la réunion Zoom d'un créneau
    """
    try:
        # Récupérer le créneau
        slot = get_object_or_404(
            VirtualAgendaSlot,
            id=slot_id,
            forum_id=forum_id,
            recruiter=request.user
        )
        
        # Vérifier qu'il y a une réunion à supprimer
        if not slot.meeting_link:
            return Response({
                'error': 'Aucune réunion Zoom à supprimer'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extraire l'ID de réunion depuis le lien
        meeting_id = slot.meeting_link.split('/')[-1].split('?')[0]
        
        # Créer le service Zoom
        zoom_service = ZoomService()
        
        # Supprimer la réunion
        with transaction.atomic():
            zoom_service.delete_meeting(meeting_id)
            slot.meeting_link = None
            slot.save()
        
        return Response({
            'success': True,
            'message': 'Réunion Zoom supprimée avec succès'
        })
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la suppression de la réunion Zoom',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_zoom_meetings(request, forum_id):
    """
    Récupérer toutes les réunions Zoom d'un utilisateur pour un forum
    """
    try:
        # Récupérer les créneaux avec des liens de réunion pour l'utilisateur
        slots = VirtualAgendaSlot.objects.filter(
            forum_id=forum_id,
            meeting_link__isnull=False,
            type='video'
        ).filter(
            models.Q(recruiter=request.user) | models.Q(candidate=request.user)
        ).select_related('recruiter', 'candidate', 'forum')
        
        meetings = []
        zoom_service = ZoomService()
        
        for slot in slots:
            try:
                # Extraire l'ID de réunion depuis le lien
                meeting_id = slot.meeting_link.split('/')[-1].split('?')[0]
                
                # Récupérer les informations de la réunion
                meeting_info = zoom_service.get_meeting_info(meeting_id)
                
                meetings.append({
                    'slot_id': slot.id,
                    'meeting_link': slot.meeting_link,
                    'meeting_id': meeting_id,
                    'participants': zoom_service.get_meeting_participants_info(slot),
                    'slot_info': {
                        'date': slot.date.isoformat(),
                        'start_time': slot.start_time.isoformat(),
                        'end_time': slot.end_time.isoformat(),
                        'duration': slot.duration,
                        'description': slot.description,
                        'status': slot.status
                    },
                    'forum_info': {
                        'id': slot.forum.id,
                        'name': slot.forum.name
                    },
                    'zoom_info': meeting_info
                })
            except Exception as e:
                # Continuer même si une réunion échoue
                continue
        
        return Response({
            'meetings': meetings,
            'total': len(meetings)
        })
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des réunions Zoom',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
