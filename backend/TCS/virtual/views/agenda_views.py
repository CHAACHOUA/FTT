from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.db import transaction
import logging
from forums.models import Forum
from ..models import VirtualAgendaSlot
from ..serializers import (
    VirtualAgendaSlotSerializer, 
    VirtualAgendaSlotCreateSerializer,
    VirtualAgendaSlotUpdateSerializer,

)

User = get_user_model()

# Configuration du logger
logger = logging.getLogger(__name__)

class VirtualAgendaSlotListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer les créneaux d'agenda virtuel
    """
    serializer_class = VirtualAgendaSlotSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """Liste des créneaux d'agenda"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VirtualAgendaSlotCreateSerializer
        return VirtualAgendaSlotSerializer

    def post(self, request, *args, **kwargs):
        serializer = VirtualAgendaSlotCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                forum_id = kwargs['forum_id']
                forum = get_object_or_404(Forum, id=forum_id)
                
                recruiter_email = serializer.validated_data.get('recruiter')
                if not recruiter_email:
                    return Response({'error': 'Recruteur requis'}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    recruiter_user = User.objects.get(email=recruiter_email)
                except User.DoesNotExist:
                    return Response({'error': 'Recruteur invalide'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Vérifier si le créneau existe déjà
                existing_slot = VirtualAgendaSlot.objects.filter(
                    forum=forum,
                    recruiter=recruiter_user,
                    date=serializer.validated_data['date'],
                    start_time=serializer.validated_data['start_time'],
                    end_time=serializer.validated_data['end_time']
                ).first()
                
                if existing_slot:
                    return Response({
                        'id': existing_slot.id,
                        'date': existing_slot.date,
                        'start_time': existing_slot.start_time,
                        'end_time': existing_slot.end_time,
                        'type': existing_slot.type,
                        'duration': existing_slot.duration,
                        'status': existing_slot.status,
                        'description': existing_slot.description,
                        'message': 'Créneau déjà existant'
                    }, status=status.HTTP_200_OK)
                
                # Vérifier que le recruteur spécifié est valide
                if recruiter_user.role == 'candidate' or hasattr(recruiter_user, 'candidate_profile'):
                    return Response({'error': 'Le recruteur spécifié n\'est pas un recruteur valide'}, status=status.HTTP_400_BAD_REQUEST)
                
                if not hasattr(recruiter_user, 'recruiter_profile'):
                    return Response({'error': 'Le recruteur spécifié n\'est pas un recruteur valide'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Vérification des conflits de créneaux
                start_time = serializer.validated_data.get('start_time')
                end_time = serializer.validated_data.get('end_time')
                date = serializer.validated_data.get('date')
                
                # Vérifier les conflits dans TOUS les forums pour ce recruteur
                conflicting_slots = VirtualAgendaSlot.objects.filter(
                    recruiter=recruiter_user,
                    date=date,
                    status__in=['available', 'booked']
                ).exclude(
                    Q(end_time__lte=start_time) | Q(start_time__gte=end_time)
                )
                
                if conflicting_slots.exists():
                    conflicting_info = []
                    for conflict in conflicting_slots:
                        conflicting_info.append({
                            'id': conflict.id,
                            'start_time': conflict.start_time,
                            'end_time': conflict.end_time,
                            'type': conflict.type,
                            'forum_name': conflict.forum.name,
                            'forum_id': conflict.forum.id
                        })
                    
                    first_conflict = conflicting_slots.first()
                    forum_name = first_conflict.forum.name
                    conflict_message = f'Le recruteur a déjà un créneau de {first_conflict.start_time} à {first_conflict.end_time} le {date} dans le forum "{forum_name}"'
                    
                    return Response({
                        'error': 'Conflit de créneaux détecté',
                        'message': conflict_message,
                        'conflicting_slots': conflicting_info
                    }, status=status.HTTP_409_CONFLICT)
                
                slot = VirtualAgendaSlot.objects.create(
                    forum=forum,
                    recruiter=recruiter_user,
                    **{k: v for k, v in serializer.validated_data.items() if k != 'recruiter'}
                )
                
                return Response({
                    'id': slot.id,
                    'date': slot.date,
                    'start_time': slot.start_time,
                    'end_time': slot.end_time,
                    'type': slot.type,
                    'duration': slot.duration,
                    'status': slot.status,
                    'description': slot.description
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        forum_id = self.kwargs['forum_id']
        recruiter_id = self.request.query_params.get('recruiter_id')
        
        # Si l'utilisateur connecté est un recruteur, filtrer par ses créneaux
        if hasattr(self.request.user, 'recruiter_profile') and self.request.user.role != 'candidate':
            # Vérifier que le recruteur a accès à ce forum via RecruiterForumParticipation
            forum = get_object_or_404(Forum, id=forum_id)
            from recruiters.models import RecruiterForumParticipation
            if not RecruiterForumParticipation.objects.filter(
                forum=forum, 
                recruiter=self.request.user.recruiter_profile
            ).exists():
                return VirtualAgendaSlot.objects.none()
            
            # Récupérer TOUS les slots du forum, pas seulement ceux du recruteur connecté
            queryset = VirtualAgendaSlot.objects.filter(
                forum_id=forum_id
            ).exclude(
                # Exclure les créneaux où le recruteur est un candidat
                recruiter__role='candidate'
            ).exclude(
                # Exclure les créneaux où le recruteur a un profil candidat
                recruiter__candidate_profile__isnull=False
            )
        else:
            # Filtrer uniquement les créneaux des vrais recruteurs ET disponibles
            queryset = VirtualAgendaSlot.objects.filter(
                forum_id=forum_id,
                status='available'  # Seulement les créneaux disponibles
            ).exclude(
                # Exclure les créneaux où le recruteur est un candidat
                recruiter__role='candidate'
            ).exclude(
                # Exclure les créneaux où le recruteur a un profil candidat
                recruiter__candidate_profile__isnull=False
            )
        
        # Filtrer par recruteur si spécifié
        if recruiter_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                recruiter_user = User.objects.get(id=recruiter_id)
                if recruiter_user.role == 'candidate' or hasattr(recruiter_user, 'candidate_profile'):
                    return VirtualAgendaSlot.objects.none()
            except User.DoesNotExist:
                return VirtualAgendaSlot.objects.none()
            
            queryset = queryset.filter(recruiter_id=recruiter_id)
        
        # Filtrer par date si spécifiée
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # Filtrer par statut si spécifié
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        final_queryset = queryset.order_by('date', 'start_time').select_related('recruiter', 'candidate', 'forum')
        
        return final_queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        forum_id = self.kwargs['forum_id']
        context['forum'] = get_object_or_404(Forum, id=forum_id)
        return context

    def perform_create(self, serializer):
        forum_id = self.kwargs['forum_id']
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Vérifier que l'utilisateur est membre de l'équipe du forum via RecruiterForumParticipation
        from recruiters.models import RecruiterForumParticipation
        is_member = RecruiterForumParticipation.objects.filter(
            forum=forum, 
            recruiter=self.request.user.recruiter_profile
        ).exists()
        
        if not is_member:
            raise PermissionDenied("Vous n'êtes pas membre de l'équipe de ce forum")
        
        try:
            serializer.save(forum=forum, recruiter=self.request.user)
        except Exception as e:
            raise

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

    def put(self, request, *args, **kwargs):
        """Override PUT method to provide better error handling"""
        logger.info(f"🔍 PUT request received for slot {kwargs.get('slot_id')} in forum {kwargs.get('forum_id')}")
        logger.info(f"🔍 Request data: {request.data}")
        logger.info(f"🔍 Request user: {request.user}")
        
        try:
            # Vérifier que le slot existe
            slot = self.get_object()
            logger.info(f"🔍 Slot found: {slot}")
            logger.info(f"🔍 Slot recruiter: {slot.recruiter}")
            logger.info(f"🔍 Slot can be modified: {slot.can_be_modified()}")
            
            # Vérifier les permissions
            if slot.recruiter != request.user:
                logger.error(f"❌ Permission denied: User {request.user} cannot modify slot owned by {slot.recruiter}")
                return Response({'error': 'Vous ne pouvez modifier que vos propres créneaux'}, status=status.HTTP_403_FORBIDDEN)
            
            if not slot.can_be_modified():
                logger.error(f"❌ Slot cannot be modified: status={slot.status}")
                return Response({'error': 'Ce créneau ne peut pas être modifié'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Sérialiser les données (partial=True pour permettre la mise à jour partielle)
            serializer = self.get_serializer(slot, data=request.data, partial=True)
            logger.info(f"🔍 Serializer created: {serializer}")
            
            if serializer.is_valid():
                logger.info(f"✅ Serializer is valid, saving...")
                serializer.save()
                logger.info(f"✅ Slot updated successfully")
                return Response(serializer.data)
            else:
                logger.error(f"❌ Serializer validation failed: {serializer.errors}")
                return Response({'error': 'Données invalides', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                
        except PermissionError as e:
            logger.error(f"❌ Permission error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            logger.error(f"❌ Value error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
            return Response({'error': f'Erreur lors de la mise à jour: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        """Override PATCH method to provide better error handling"""
        try:
            return super().patch(request, *args, **kwargs)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Erreur lors de la mise à jour: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        # Vérifier que l'utilisateur peut modifier ce créneau
        slot = self.get_object()
        if slot.recruiter != self.request.user:
            raise PermissionError("Vous ne pouvez modifier que vos propres créneaux")
        
        # Vérifier que le créneau peut être modifié
        if not slot.can_be_modified():
            raise ValueError("Ce créneau ne peut pas être modifié")
        
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
    Créer plusieurs créneaux en une seule requête avec vérification des conflits
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Préparer les données des créneaux
        slots_data = request.data.get('slots', [])
        created_slots = []
        conflicts = []
        
        for slot_data in slots_data:
            # Ajouter les champs obligatoires
            slot_data['forum'] = forum.id
            
            # VÉRIFICATION: S'assurer que l'utilisateur connecté est un recruteur
            if request.user.role == 'candidate' or hasattr(request.user, 'candidate_profile'):
                return Response({
                    'error': 'Seuls les recruteurs peuvent créer des créneaux d\'agenda'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if not hasattr(request.user, 'recruiter_profile'):
                return Response({
                    'error': 'Vous n\'êtes pas un recruteur valide'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Utiliser l'utilisateur connecté comme recruteur (qui est maintenant vérifié)
            recruiter_id = slot_data.get('recruiter', request.user.id)
            slot_data['recruiter'] = recruiter_id
            
            # VÉRIFICATION DES CONFLITS pour chaque créneau
            start_time = slot_data.get('start_time')
            end_time = slot_data.get('end_time')
            date = slot_data.get('date')
            
            # Vérifier les conflits dans TOUS les forums pour ce recruteur
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                recruiter_user = User.objects.get(id=recruiter_id)
            except User.DoesNotExist:
                return Response({'error': 'Recruteur non trouvé'}, status=status.HTTP_400_BAD_REQUEST)
            
            conflicting_slots = VirtualAgendaSlot.objects.filter(
                recruiter=recruiter_user,  # Même recruteur
                date=date,                # Même date
                status__in=['available', 'booked']  # Seulement les créneaux actifs
            ).exclude(
                # Exclure les créneaux qui ne se chevauchent pas
                Q(end_time__lte=start_time) | Q(start_time__gte=end_time)
            )
            
            if conflicting_slots.exists():
                # Collecter les informations de conflit
                for conflict in conflicting_slots:
                    conflicts.append({
                        'slot_data': slot_data,
                        'conflict_info': {
                            'id': conflict.id,
                            'start_time': conflict.start_time,
                            'end_time': conflict.end_time,
                            'type': conflict.type,
                            'forum_name': conflict.forum.name,
                            'forum_id': conflict.forum.id
                        }
                    })
            else:
                # Aucun conflit, créer le créneau
                serializer = VirtualAgendaSlotSerializer(data=slot_data, context={'forum': forum})
                if serializer.is_valid():
                    slot = serializer.save()
                    created_slots.append(slot)
                else:
                    return Response({
                        'error': 'Données invalides',
                        'details': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Si des conflits ont été détectés, retourner une erreur
        if conflicts:
            first_conflict = conflicts[0]
            conflict_info = first_conflict['conflict_info']
            conflict_message = f'Le recruteur a déjà un créneau de {conflict_info["start_time"]} à {conflict_info["end_time"]} le {first_conflict["slot_data"]["date"]} dans le forum "{conflict_info["forum_name"]}"'
            
            return Response({
                'error': 'Conflit de créneaux détecté',
                'message': conflict_message,
                'conflicts': conflicts
            }, status=status.HTTP_409_CONFLICT)
        
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
def get_recruiter_slots(request, forum_id, recruiter_id):
    """
    Récupérer les créneaux d'un recruteur spécifique
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        recruiter = get_object_or_404(User, id=recruiter_id)
        
        # Vérifier que le recruteur fait partie de l'équipe
        is_team_member = User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum),
            id=recruiter_id
        ).exists()
        
        if not is_team_member:
            return Response({
                'error': 'Ce recruteur ne fait pas partie de l\'équipe'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier que le recruteur est bien un recruteur
        if recruiter.role == 'candidate' or hasattr(recruiter, 'candidate_profile'):
            return Response({
                'error': 'L\'utilisateur spécifié n\'est pas un recruteur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cleanup_candidate_slots(request, forum_id):
    """
    Nettoyer les créneaux créés avec des candidats au lieu de recruteurs
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer les créneaux avec des candidats
        candidate_slots = VirtualAgendaSlot.objects.filter(
            forum=forum
        ).select_related('recruiter')
        
        # Filtrer ceux qui ont des candidats comme recruteurs
        slots_to_delete = []
        for slot in candidate_slots:
            if hasattr(slot.recruiter, 'candidate_profile'):
                slots_to_delete.append(slot)
        
        print(f"🔧 [BACKEND] Créneaux à nettoyer: {len(slots_to_delete)}")
        
        if slots_to_delete:
            for slot in slots_to_delete:
                print(f"🗑️ [BACKEND] Suppression du créneau {slot.id} (recruteur: {slot.recruiter.email})")
                slot.delete()
        
        return Response({
            'message': f'{len(slots_to_delete)} créneaux incorrects supprimés',
            'deleted_count': len(slots_to_delete)
        })
        
    except Exception as e:
        print(f"❌ [BACKEND] Erreur lors du nettoyage: {e}")
        return Response({
            'error': 'Erreur lors du nettoyage des créneaux',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def force_refresh_agenda(request, forum_id):
    """
    Forcer le rafraîchissement de l'agenda après une mise à jour
    """
    try:
        print(f"🔄 [BACKEND] Rafraîchissement forcé de l'agenda pour le forum {forum_id}")
        
        # Vider tous les caches Django
        from django.core.cache import cache
        cache.clear()
        print(f"🔄 [BACKEND] Cache Django vidé")
        
        # Récupérer les slots mis à jour
        from virtual.models import VirtualAgendaSlot
        slots = VirtualAgendaSlot.objects.filter(forum_id=forum_id).select_related('recruiter', 'candidate')
        
        return Response({
            'message': 'Agenda rafraîchi avec succès',
            'slots_count': slots.count()
        })
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors du rafraîchissement',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_forum_recruiters(request, forum_id):
    """
    Récupérer la liste des recruteurs d'un forum
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Récupérer les recruteurs du forum via la relation ManyToMany
        recruiters = forum.recruiters.all()
        
        recruiter_list = []
        for recruiter in recruiters:
            recruiter_info = {
                'id': recruiter.user.id,
                'email': recruiter.user.email,
                'first_name': recruiter.first_name,
                'last_name': recruiter.last_name,
                'full_name': f"{recruiter.first_name} {recruiter.last_name}".strip(),
                'company': recruiter.company.name,
                'role': recruiter.user.role
            }
            recruiter_list.append(recruiter_info)
            print(f"  - Recruteur: {recruiter_info['full_name']} ({recruiter_info['email']}) - {recruiter_info['company']}")
        
        return Response({
            'recruiters': recruiter_list,
            'count': len(recruiter_list)
        })
        
    except Exception as e:
        print(f"❌ [BACKEND] Erreur lors de la récupération des recruteurs: {e}")
        return Response({
            'error': 'Erreur lors de la récupération des recruteurs',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agenda_stats(request, forum_id):
    """
    Récupérer les statistiques de l'agenda
    """
    try:
        print(f"[AGENDA_STATS] forum_id={forum_id}")
        forum = get_object_or_404(Forum, id=forum_id)
        print(f"[AGENDA_STATS] forum={forum.name}")
        
        # Statistiques globales - CORRECTION: Exclure les créneaux des candidats
        base_queryset = VirtualAgendaSlot.objects.filter(forum=forum)
        print(f"[AGENDA_STATS] total_slots_all={base_queryset.count()}")
        base_queryset = base_queryset.exclude(
            recruiter__role='candidate'
        ).exclude(
            recruiter__candidate_profile__isnull=False
        )
        print(f"[AGENDA_STATS] total_slots_filtered={base_queryset.count()}")
        
        total_slots = base_queryset.count()
        available_slots = base_queryset.filter(status='available').count()
        booked_slots = base_queryset.filter(status='booked').count()
        completed_slots = base_queryset.filter(status='completed').count()
        cancelled_slots = base_queryset.filter(status='cancelled').count()
        print(f"[AGENDA_STATS] totals: total={total_slots} available={available_slots} booked={booked_slots} completed={completed_slots} cancelled={cancelled_slots}")
        
        # Statistiques par recruteur - basé sur les slots existants (plus robuste)
        recruiter_stats = []
        recruiter_ids = base_queryset.values_list('recruiter', flat=True).distinct()
        print(f"[AGENDA_STATS] recruiter_ids={list(recruiter_ids)}")
        for rid in recruiter_ids:
            try:
                recruiter = User.objects.get(id=rid)
            except User.DoesNotExist:
                print(f"[AGENDA_STATS] recruiter {rid} does not exist")
                continue
            # Exclure les comptes candidats
            if hasattr(recruiter, 'candidate_profile') or getattr(recruiter, 'role', None) == 'candidate':
                print(f"[AGENDA_STATS] skip candidate-like user id={rid}")
                continue
            recruiter_slots = VirtualAgendaSlot.objects.filter(forum=forum, recruiter=recruiter)
            full_name = getattr(recruiter, 'first_name', '')
            last_name = getattr(recruiter, 'last_name', '')
            full_name = f"{full_name} {last_name}".strip() or getattr(recruiter, 'username', '')
            recruiter_stats.append({
                'recruiter_id': recruiter.id,
                'recruiter_name': full_name,
                'total_slots': recruiter_slots.count(),
                'available_slots': recruiter_slots.filter(status='available').count(),
                'booked_slots': recruiter_slots.filter(status='booked').count(),
                'completed_slots': recruiter_slots.filter(status='completed').count(),
                'cancelled_slots': recruiter_slots.filter(status='cancelled').count()
            })
        print(f"[AGENDA_STATS] recruiter_stats_len={len(recruiter_stats)}")
        
        return Response({
            'total_slots': total_slots,
            'available_slots': available_slots,
            'booked_slots': booked_slots,
            'completed_slots': completed_slots,
            'cancelled_slots': cancelled_slots,
            'recruiter_stats': recruiter_stats
        })
        
    except Exception as e:
        import traceback
        print("[AGENDA_STATS][ERROR]", str(e))
        traceback.print_exc()
        return Response({
            'error': 'Erreur lors de la récupération des statistiques',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_slots_for_offer(request, forum_id, offer_id):
    """
    Récupérer les créneaux disponibles pour une offre spécifique
    (uniquement les créneaux des recruteurs de l'entreprise de l'offre)
    """
    try:
        forum = get_object_or_404(Forum, id=forum_id)
        from recruiters.models import Offer
        offer = get_object_or_404(Offer, id=offer_id)
        
        print(f"🔍 [SLOTS API] Forum: {forum.name}")
        print(f"🔍 [SLOTS API] Offer: {offer.title}")
        print(f"🔍 [SLOTS API] Company: {offer.company.name}")
        
        # Vérifier que l'utilisateur est un candidat
        if not hasattr(request.user, 'candidate_profile'):
            return Response({
                'error': 'Seuls les candidats peuvent accéder à cette ressource'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer tous les slots du forum d'abord
        all_slots = VirtualAgendaSlot.objects.filter(forum=forum)
        print(f"🔍 [SLOTS API] Total slots in forum: {all_slots.count()}")
        
        # Récupérer les créneaux des recruteurs de l'entreprise de l'offre
        slots = VirtualAgendaSlot.objects.filter(
            forum=forum,
            recruiter__recruiter_profile__company=offer.company,
            status='available'
        ).select_related('recruiter', 'recruiter__recruiter_profile').order_by('date', 'start_time')
        
        print(f"🔍 [SLOTS API] Slots for company {offer.company.name}: {slots.count()}")
        
        # Debug: afficher les recruteurs de l'entreprise
        from users.models import User
        company_recruiters = User.objects.filter(
            recruiter_profile__company=offer.company,
            role='recruiter'
        )
        print(f"🔍 [SLOTS API] Recruiters in company: {company_recruiters.count()}")
        for recruiter in company_recruiters:
            print(f"   - {recruiter.email}")
        
        serializer = VirtualAgendaSlotSerializer(slots, many=True)
        print(f"🔍 [SLOTS API] Serialized slots: {len(serializer.data)}")
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des créneaux',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
