from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from forums.models import Forum
from .models import VirtualAgendaSlot
from .serializers import (
    VirtualAgendaSlotSerializer, 
    VirtualAgendaSlotCreateSerializer,
    VirtualAgendaSlotUpdateSerializer,
    TeamMemberSerializer
)

User = get_user_model()

class VirtualAgendaSlotListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer les créneaux d'agenda virtuel
    """
    serializer_class = VirtualAgendaSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        forum_id = self.kwargs['forum_id']
        recruiter_id = self.request.query_params.get('recruiter_id')
        
        queryset = VirtualAgendaSlot.objects.filter(forum_id=forum_id)
        
        # Filtrer par recruteur si spécifié
        if recruiter_id:
            queryset = queryset.filter(recruiter_id=recruiter_id)
        
        # Filtrer par date si spécifiée
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # Filtrer par statut si spécifié
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('date', 'start_time')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        forum_id = self.kwargs['forum_id']
        context['forum'] = get_object_or_404(Forum, id=forum_id)
        return context

    def perform_create(self, serializer):
        forum_id = self.kwargs['forum_id']
        forum = get_object_or_404(Forum, id=forum_id)
        serializer.save(forum=forum, recruiter=self.request.user)

class VirtualAgendaSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un créneau spécifique
    """
    serializer_class = VirtualAgendaSlotUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        forum_id = self.kwargs['forum_id']
        return VirtualAgendaSlot.objects.filter(forum_id=forum_id)

    def get_object(self):
        forum_id = self.kwargs['forum_id']
        slot_id = self.kwargs['slot_id']
        return get_object_or_404(
            VirtualAgendaSlot, 
            id=slot_id, 
            forum_id=forum_id
        )

    def perform_update(self, serializer):
        # Vérifier que l'utilisateur peut modifier ce créneau
        slot = self.get_object()
        if slot.recruiter != self.request.user:
            raise PermissionError("Vous ne pouvez modifier que vos propres créneaux")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Vérifier que l'utilisateur peut supprimer ce créneau
        if instance.recruiter != self.request.user:
            raise PermissionError("Vous ne pouvez supprimer que vos propres créneaux")
        
        if not instance.can_be_deleted():
            raise ValueError("Ce créneau ne peut pas être supprimé")
        
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_multiple_slots(request, forum_id):
    """
    Créer plusieurs créneaux en une seule requête
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Préparer les données des créneaux
        slots_data = request.data.get('slots', [])
        created_slots = []
        
        for slot_data in slots_data:
            # Ajouter les champs obligatoires
            slot_data['forum'] = forum.id
            slot_data['recruiter'] = request.user.id
            
            serializer = VirtualAgendaSlotSerializer(data=slot_data, context={'forum': forum})
            if serializer.is_valid():
                slot = serializer.save()
                created_slots.append(slot)
            else:
                return Response({
                    'error': 'Données invalides',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Retourner les créneaux créés
        response_serializer = VirtualAgendaSlotSerializer(created_slots, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la création des créneaux',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_team_members(request, forum_id):
    """
    Récupérer les membres de l'équipe pour un forum
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer les recruteurs de l'entreprise du forum
        team_members = User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum)
        ).distinct()
        
        serializer = TeamMemberSerializer(
            team_members, 
            many=True, 
            context={'request': request}
        )
        
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des membres',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recruiter_slots(request, forum_id, recruiter_id):
    """
    Récupérer les créneaux d'un recruteur spécifique
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        recruiter = get_object_or_404(User, id=recruiter_id)
        
        # Vérifier que le recruteur fait partie de l'équipe
        if not User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum),
            id=recruiter_id
        ).exists():
            return Response({
                'error': 'Ce recruteur ne fait pas partie de l\'équipe'
            }, status=status.HTTP_403_FORBIDDEN)
        
        slots = VirtualAgendaSlot.objects.filter(
            forum=forum,
            recruiter=recruiter
        ).order_by('date', 'start_time')
        
        serializer = VirtualAgendaSlotSerializer(slots, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des créneaux',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_slot(request, forum_id, slot_id):
    """
    Réserver un créneau (pour un candidat)
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        slot = get_object_or_404(VirtualAgendaSlot, id=slot_id, forum=forum)
        
        if slot.status != 'available':
            return Response({
                'error': 'Ce créneau n\'est pas disponible'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mettre à jour le statut et le candidat
        slot.status = 'booked'
        slot.candidate = request.user
        slot.save()
        
        serializer = VirtualAgendaSlotSerializer(slot)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la réservation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_slot(request, forum_id, slot_id):
    """
    Annuler un créneau
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        slot = get_object_or_404(VirtualAgendaSlot, id=slot_id, forum=forum)
        
        # Vérifier que l'utilisateur peut annuler ce créneau
        if slot.recruiter != request.user and slot.candidate != request.user:
            return Response({
                'error': 'Vous ne pouvez annuler que vos propres créneaux'
            }, status=status.HTTP_403_FORBIDDEN)
        
        slot.status = 'cancelled'
        slot.candidate = None
        slot.save()
        
        serializer = VirtualAgendaSlotSerializer(slot)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de l\'annulation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agenda_stats(request, forum_id):
    """
    Récupérer les statistiques de l'agenda
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Statistiques globales
        total_slots = VirtualAgendaSlot.objects.filter(forum=forum).count()
        available_slots = VirtualAgendaSlot.objects.filter(forum=forum, status='available').count()
        booked_slots = VirtualAgendaSlot.objects.filter(forum=forum, status='booked').count()
        completed_slots = VirtualAgendaSlot.objects.filter(forum=forum, status='completed').count()
        cancelled_slots = VirtualAgendaSlot.objects.filter(forum=forum, status='cancelled').count()
        
        # Statistiques par recruteur
        recruiter_stats = []
        recruiters = User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum)
        ).distinct()
        
        for recruiter in recruiters:
            recruiter_slots = VirtualAgendaSlot.objects.filter(forum=forum, recruiter=recruiter)
            recruiter_stats.append({
                'recruiter_id': recruiter.id,
                'recruiter_name': recruiter.get_full_name(),
                'total_slots': recruiter_slots.count(),
                'available_slots': recruiter_slots.filter(status='available').count(),
                'booked_slots': recruiter_slots.filter(status='booked').count(),
                'completed_slots': recruiter_slots.filter(status='completed').count(),
                'cancelled_slots': recruiter_slots.filter(status='cancelled').count()
            })
        
        return Response({
            'total_slots': total_slots,
            'available_slots': available_slots,
            'booked_slots': booked_slots,
            'completed_slots': completed_slots,
            'cancelled_slots': cancelled_slots,
            'recruiter_stats': recruiter_stats
        })
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des statistiques',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)