from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer
from .services.notification_service import NotificationService
from rest_framework_simplejwt.tokens import AccessToken
import logging

logger = logging.getLogger(__name__)


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    Récupère la liste des notifications de l'utilisateur connecté
    """
    try:
        user = request.user
        is_read = request.query_params.get('is_read', None)
        priority = request.query_params.get('priority', None)
        
        queryset = Notification.objects.filter(user=user)
        
        # Filtres
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Pagination
        paginator = NotificationPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = NotificationSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = NotificationSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des notifications: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la récupération des notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    """
    Retourne le nombre de notifications non lues
    """
    try:
        count = NotificationService.get_unread_count(request.user)
        return Response({'count': count}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"❌ Erreur lors du comptage des notifications: {str(e)}")
        return Response(
            {'error': 'Erreur lors du comptage des notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def websocket_token(request):
    """
    Retourne un token JWT pour la connexion WebSocket
    """
    try:
        # Créer un token d'accès pour WebSocket
        token = AccessToken.for_user(request.user)
        return Response({
            'token': str(token),
            'ws_url': f"ws://localhost:8000/ws/notifications/?token={token}"
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération du token WebSocket: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la génération du token'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, notification_id):
    """
    Marque une notification comme lue
    """
    try:
        notification = NotificationService.mark_as_read(notification_id, request.user)
        if notification:
            serializer = NotificationSerializer(notification, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as e:
        logger.error(f"❌ Erreur lors du marquage de la notification: {str(e)}")
        return Response(
            {'error': 'Erreur lors du marquage de la notification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """
    Marque toutes les notifications comme lues
    """
    try:
        count = NotificationService.mark_all_as_read(request.user)
        return Response(
            {'message': f'{count} notifications marquées comme lues', 'count': count},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"❌ Erreur lors du marquage de toutes les notifications: {str(e)}")
        return Response(
            {'error': 'Erreur lors du marquage des notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def notification_delete(request, notification_id):
    """
    Supprime une notification
    """
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.delete()
        return Response(
            {'message': 'Notification supprimée'},
            status=status.HTTP_204_NO_CONTENT
        )
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"❌ Erreur lors de la suppression de la notification: {str(e)}")
        return Response(
            {'error': 'Erreur lors de la suppression de la notification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
