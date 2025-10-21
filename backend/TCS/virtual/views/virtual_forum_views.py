from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from forums.models import Forum
from forums.serializers import ForumSerializer, ForumDetailSerializer
from virtual.services.virtual_forum_service import VirtualForumService


@api_view(['GET'])
def get_virtual_forums(request):
    """
    Retourne tous les forums virtuels
    """
    try:
        forums = VirtualForumService.get_virtual_forums()
        serializer = ForumSerializer(forums, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_forums_by_phase(request, phase):
    """
    Retourne les forums virtuels selon leur phase actuelle
    """
    try:
        forums = VirtualForumService.get_forums_by_phase(phase)
        serializer = ForumSerializer(forums, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_forum_phase_info(request, forum_id):
    """
    Retourne les informations de phase d'un forum virtuel
    """
    try:
        phase_info = VirtualForumService.get_forum_phase_info(forum_id)
        return Response(phase_info, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_forum_phases(request, forum_id):
    """
    Met à jour les phases d'un forum virtuel (réservé aux organisateurs)
    """
    try:
        # Vérifier que l'utilisateur est un organisateur
        if not hasattr(request.user, 'organizer'):
            return Response(
                {"detail": "Seuls les organisateurs peuvent modifier les phases des forums"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Valider la séquence des phases
        validation_errors = VirtualForumService.validate_phase_sequence(request.data)
        if validation_errors:
            return Response(
                {"detail": "Erreurs de validation", "errors": validation_errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        forum = VirtualForumService.update_forum_phases(forum_id, request.data)
        serializer = ForumDetailSerializer(forum)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_forum_permissions(request, forum_id):
    """
    Retourne les permissions selon la phase actuelle du forum et le rôle de l'utilisateur
    """
    try:
        # Déterminer le rôle de l'utilisateur
        user_role = None
        if hasattr(request.user, 'candidate'):
            user_role = 'candidate'
        elif hasattr(request.user, 'recruiter'):
            user_role = 'recruiter'
        elif hasattr(request.user, 'organizer'):
            user_role = 'organizer'
        
        if not user_role:
            return Response(
                {"detail": "Rôle utilisateur non reconnu"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        permissions = VirtualForumService.get_forum_phase_permissions(forum_id, user_role)
        return Response(permissions, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_virtual_forum_detail(request, forum_id):
    """
    Retourne les détails d'un forum virtuel avec ses informations de phase
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id, type='virtuel')
        serializer = ForumDetailSerializer(forum)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
