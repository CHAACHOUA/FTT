from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from forums.models import Forum
from ..models import VirtualAgendaSlot
from ..serializers import (
    VirtualAgendaSlotSerializer, 
    VirtualAgendaSlotCreateSerializer,
    VirtualAgendaSlotUpdateSerializer,

)

User = get_user_model()

class VirtualAgendaSlotListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer les créneaux d'agenda virtuel
    """
    serializer_class = VirtualAgendaSlotSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """Override de la méthode list pour ajouter des logs de débogage"""
        print(f"🔍 [BACKEND] === DÉBUT LISTE CRÉNEAUX ===")
        print(f"🔍 [BACKEND] Forum ID: {kwargs.get('forum_id')}")
        print(f"🔍 [BACKEND] Utilisateur: {request.user}")
        print(f"🔍 [BACKEND] Rôle utilisateur: {request.user.role}")
        print(f"🔍 [BACKEND] Paramètres: {dict(request.query_params)}")
        
        queryset = self.get_queryset()
        print(f"🔍 [BACKEND] Queryset final: {queryset.count()} créneaux")
        
        # Afficher les détails de chaque créneau
        if queryset.exists():
            print(f"🔍 [BACKEND] Détails des créneaux:")
            for slot in queryset:
                print(f"  - ID: {slot.id}, Date: {slot.date}, Heure: {slot.start_time}-{slot.end_time}")
                print(f"    Recruteur: {slot.recruiter} (ID: {slot.recruiter.id}, Rôle: {slot.recruiter.role})")
                print(f"    Statut: {slot.status}, Type: {slot.type}")
        
        serializer = self.get_serializer(queryset, many=True)
        print(f"🔍 [BACKEND] Données sérialisées: {len(serializer.data)} éléments")
        
        if serializer.data:
            print(f"🔍 [BACKEND] Premier créneau sérialisé:")
            first_slot = serializer.data[0]
            print(f"  - ID: {first_slot.get('id')}")
            print(f"  - Date: {first_slot.get('date')}")
            print(f"  - Heure: {first_slot.get('start_time')}-{first_slot.get('end_time')}")
            print(f"  - Recruteur: {first_slot.get('recruiter_name')} ({first_slot.get('recruiter_email')})")
            print(f"  - Statut: {first_slot.get('status')}")
            print(f"  - Type: {first_slot.get('type')}")
        else:
            print(f"❌ [BACKEND] Aucune donnée sérialisée")
        
        print(f"🔍 [BACKEND] === FIN LISTE CRÉNEAUX ===")
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            print(f"🔍 [BACKEND] Utilisation de VirtualAgendaSlotCreateSerializer pour POST")
            return VirtualAgendaSlotCreateSerializer
        print(f"🔍 [BACKEND] Utilisation de VirtualAgendaSlotSerializer pour GET")
        return VirtualAgendaSlotSerializer

    def post(self, request, *args, **kwargs):
        print(f"🔍 [BACKEND] POST reçu pour forum {kwargs.get('forum_id')}")
        print(f"🔍 [BACKEND] Utilisateur: {request.user}")
        print(f"🔍 [BACKEND] Données brutes: {request.body}")
        print(f"🔍 [BACKEND] Headers: {dict(request.headers)}")
        print(f"🔍 [BACKEND] Cookies: {request.COOKIES}")
        
        # Créer le serializer manuellement
        serializer = VirtualAgendaSlotCreateSerializer(data=request.data)
        print(f"🔍 [BACKEND] Serializer créé: {serializer}")
        print(f"🔍 [BACKEND] Données du serializer: {serializer.initial_data}")
        
        if serializer.is_valid():
            print(f"✅ [BACKEND] Serializer valide")
            try:
                # Créer le créneau manuellement
                forum_id = kwargs['forum_id']
                forum = get_object_or_404(Forum, id=forum_id)
                
                # Pour l'instant, on autorise tous les recruteurs connectés
                # TODO: Ajouter une vérification de l'appartenance à l'équipe du forum
                print(f"🔍 [BACKEND] Création autorisée pour l'utilisateur: {request.user}")
                
                # Vérifier si le créneau existe déjà
                existing_slot = VirtualAgendaSlot.objects.filter(
                    forum=forum,
                    recruiter=request.user,
                    date=serializer.validated_data['date'],
                    start_time=serializer.validated_data['start_time'],
                    end_time=serializer.validated_data['end_time']
                ).first()
                
                if existing_slot:
                    print(f"⚠️ [BACKEND] Créneau déjà existant: {existing_slot}")
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
                
                # Créer le créneau
                print(f"🔍 [BACKEND] Données validées: {serializer.validated_data}")
                print(f"🔍 [BACKEND] Forum: {forum}")
                print(f"🔍 [BACKEND] User: {request.user}")
                print(f"🔍 [BACKEND] User type: {type(request.user)}")
                print(f"🔍 [BACKEND] User attributes: {dir(request.user)}")
                
                # VÉRIFICATION: S'assurer que l'utilisateur connecté est un recruteur
                if request.user.role == 'candidate' or hasattr(request.user, 'candidate_profile'):
                    print(f"❌ [BACKEND] L'utilisateur connecté {request.user} est un candidat, pas un recruteur")
                    return Response({'error': 'Seuls les recruteurs peuvent créer des créneaux d\'agenda'}, status=status.HTTP_403_FORBIDDEN)
                
                if not hasattr(request.user, 'recruiter_profile'):
                    print(f"❌ [BACKEND] L'utilisateur connecté {request.user} n'a pas de profil recruteur")
                    return Response({'error': 'Vous n\'êtes pas un recruteur valide'}, status=status.HTTP_403_FORBIDDEN)
                
                # Utiliser l'utilisateur connecté comme recruteur (maintenant vérifié)
                recruiter_user = request.user
                print(f"✅ [BACKEND] Utilisateur recruteur validé: {recruiter_user}")
                
                # VÉRIFICATION DES CONFLITS DE CRÉNEAUX
                start_time = serializer.validated_data.get('start_time')
                end_time = serializer.validated_data.get('end_time')
                date = serializer.validated_data.get('date')
                
                print(f"🔍 [BACKEND] Vérification des conflits pour {recruiter_user} le {date} de {start_time} à {end_time}")
                
                # CORRECTION: Vérifier les conflits dans TOUS les forums pour ce recruteur
                # Un recruteur ne peut pas avoir deux créneaux en même temps, même dans des forums différents
                conflicting_slots = VirtualAgendaSlot.objects.filter(
                    recruiter=recruiter_user,  # Même recruteur
                    date=date,                  # Même date
                    status__in=['available', 'booked']  # Seulement les créneaux actifs
                ).exclude(
                    # Exclure les créneaux qui ne se chevauchent pas
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
                            'forum_name': conflict.forum.name,  # Nom du forum en conflit
                            'forum_id': conflict.forum.id
                        })
                    
                    print(f"❌ [BACKEND] Conflit détecté avec {conflicting_slots.count()} créneau(x)")
                    print(f"❌ [BACKEND] Créneaux en conflit: {conflicting_info}")
                    
                    # Message d'erreur plus informatif
                    first_conflict = conflicting_slots.first()
                    forum_name = first_conflict.forum.name
                    conflict_message = f'Le recruteur a déjà un créneau de {first_conflict.start_time} à {first_conflict.end_time} le {date} dans le forum "{forum_name}"'
                    
                    return Response({
                        'error': 'Conflit de créneaux détecté',
                        'message': conflict_message,
                        'conflicting_slots': conflicting_info
                    }, status=status.HTTP_409_CONFLICT)
                
                print(f"✅ [BACKEND] Aucun conflit détecté, création du créneau")
                
                slot = VirtualAgendaSlot.objects.create(
                    forum=forum,
                    recruiter=recruiter_user,
                    **{k: v for k, v in serializer.validated_data.items() if k != 'recruiter'}
                )
                
                print(f"✅ [BACKEND] Créneau créé: {slot}")
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
                print(f"❌ [BACKEND] Erreur lors de la création: {e}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(f"❌ [BACKEND] Serializer invalide: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        forum_id = self.kwargs['forum_id']
        recruiter_id = self.request.query_params.get('recruiter_id')
        
        print(f"🔍 [BACKEND] Récupération des créneaux pour forum_id: {forum_id}")
        print(f"🔍 [BACKEND] Utilisateur connecté: {self.request.user} (rôle: {self.request.user.role})")
        print(f"🔍 [BACKEND] Paramètres de requête: {dict(self.request.query_params)}")
        
        # CORRECTION: Si l'utilisateur connecté est un recruteur, filtrer par ses créneaux
        if hasattr(self.request.user, 'recruiter_profile') and self.request.user.role != 'candidate':
            print(f"🔍 [BACKEND] Utilisateur est un recruteur, filtrage par ses créneaux (tous statuts)")
            
            # Vérifier que le recruteur a accès à ce forum via RecruiterForumParticipation
            forum = get_object_or_404(Forum, id=forum_id)
            from recruiters.models import RecruiterForumParticipation
            if not RecruiterForumParticipation.objects.filter(
                forum=forum, 
                recruiter=self.request.user.recruiter_profile
            ).exists():
                print(f"❌ [BACKEND] Le recruteur {self.request.user} n'a pas accès au forum {forum.name}")
                return VirtualAgendaSlot.objects.none()
            
            queryset = VirtualAgendaSlot.objects.filter(
                forum_id=forum_id,
                recruiter=self.request.user
            )
        else:
            print(f"🔍 [BACKEND] Utilisateur n'est pas un recruteur, récupération des créneaux DISPONIBLES uniquement")
            # Filtrer uniquement les créneaux des vrais recruteurs ET disponibles
            queryset = VirtualAgendaSlot.objects.filter(
                forum_id=forum_id,
                status='available'  # CORRECTION: Seulement les créneaux disponibles
            ).exclude(
                # Exclure les créneaux où le recruteur est un candidat
                recruiter__role='candidate'
            ).exclude(
                # Exclure les créneaux où le recruteur a un profil candidat
                recruiter__candidate_profile__isnull=False
            )
        
        print(f"🔍 [BACKEND] Créneaux après filtrage initial: {queryset.count()}")
        
        # Vérifier les statuts des créneaux
        if queryset.exists():
            statuses = queryset.values_list('status', flat=True).distinct()
            print(f"🔍 [BACKEND] Statuts des créneaux trouvés: {list(statuses)}")
        
        # Afficher les créneaux trouvés
        if queryset.exists():
            print(f"🔍 [BACKEND] Créneaux trouvés:")
            for slot in queryset:
                print(f"  - ID: {slot.id}, Date: {slot.date}, Heure: {slot.start_time}-{slot.end_time}, Recruteur: {slot.recruiter} ({slot.recruiter.role}), Statut: {slot.status}")
        else:
            print(f"❌ [BACKEND] Aucun créneau trouvé dans le forum {forum_id}")
        
        # Filtrer par recruteur si spécifié
        if recruiter_id:
            print(f"🔍 [BACKEND] Filtrage par recruteur_id: {recruiter_id}")
            # Vérifier que le recruteur spécifié est bien un recruteur
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                recruiter_user = User.objects.get(id=recruiter_id)
                if recruiter_user.role == 'candidate' or hasattr(recruiter_user, 'candidate_profile'):
                    print(f"❌ [BACKEND] Le recruteur spécifié {recruiter_user} est un candidat")
                    return VirtualAgendaSlot.objects.none()  # Retourner un queryset vide
            except User.DoesNotExist:
                print(f"❌ [BACKEND] Recruteur avec l'ID {recruiter_id} non trouvé")
                return VirtualAgendaSlot.objects.none()
            
            queryset = queryset.filter(recruiter_id=recruiter_id)
            print(f"🔍 [BACKEND] Créneaux après filtrage par recruteur: {queryset.count()}")
        
        # Filtrer par date si spécifiée
        date = self.request.query_params.get('date')
        if date:
            print(f"🔍 [BACKEND] Filtrage par date: {date}")
            queryset = queryset.filter(date=date)
            print(f"🔍 [BACKEND] Créneaux après filtrage par date: {queryset.count()}")
        
        # Filtrer par statut si spécifié
        status_filter = self.request.query_params.get('status')
        if status_filter:
            print(f"🔍 [BACKEND] Filtrage par statut: {status_filter}")
            queryset = queryset.filter(status=status_filter)
            print(f"🔍 [BACKEND] Créneaux après filtrage par statut: {queryset.count()}")
        
        final_queryset = queryset.order_by('date', 'start_time')
        print(f"🔍 [BACKEND] Créneaux finaux retournés: {final_queryset.count()}")
        
        # Simple rafraîchissement des données
        final_queryset = final_queryset.select_related('recruiter', 'candidate', 'forum')
        
        return final_queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        forum_id = self.kwargs['forum_id']
        context['forum'] = get_object_or_404(Forum, id=forum_id)
        return context

    def perform_create(self, serializer):
        forum_id = self.kwargs['forum_id']
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Logs de débogage
        print(f"🔍 [BACKEND] Création de créneau pour le forum {forum_id}")
        print(f"🔍 [BACKEND] Utilisateur: {self.request.user}")
        print(f"🔍 [BACKEND] Données reçues: {self.request.data}")
        print(f"🔍 [BACKEND] Forum trouvé: {forum}")
        print(f"🔍 [BACKEND] Données validées du serializer: {serializer.validated_data}")
        
        # Vérifier que l'utilisateur est membre de l'équipe du forum via RecruiterForumParticipation
        from recruiters.models import RecruiterForumParticipation
        is_member = RecruiterForumParticipation.objects.filter(
            forum=forum, 
            recruiter=self.request.user.recruiter_profile
        ).exists()
        print(f"🔍 [BACKEND] Utilisateur membre de l'équipe: {is_member}")
        print(f"🔍 [BACKEND] Participations au forum: {RecruiterForumParticipation.objects.filter(forum=forum).count()}")
        print(f"🔍 [BACKEND] ID utilisateur actuel: {self.request.user.id}")
        
        if not is_member:
            print(f"❌ [BACKEND] Permission refusée - utilisateur pas membre de l'équipe")
            raise PermissionDenied("Vous n'êtes pas membre de l'équipe de ce forum")
        
        try:
            serializer.save(forum=forum, recruiter=self.request.user)
            print(f"✅ [BACKEND] Créneau créé avec succès")
        except Exception as e:
            print(f"❌ [BACKEND] Erreur lors de la création du créneau: {e}")
            print(f"❌ [BACKEND] Type d'erreur: {type(e)}")
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
        print(f"🔍 [BACKEND] === RÉCUPÉRATION CRÉNEAUX RECRUTEUR ===")
        print(f"🔍 [BACKEND] Forum ID: {forum_id}, Recruteur ID: {recruiter_id}")
        
        forum = get_object_or_404(Forum, id=forum_id)
        recruiter = get_object_or_404(User, id=recruiter_id)
        
        print(f"🔍 [BACKEND] Forum trouvé: {forum}")
        print(f"🔍 [BACKEND] Recruteur trouvé: {recruiter}")
        
        # Vérifier que le recruteur fait partie de l'équipe
        is_team_member = User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum),
            id=recruiter_id
        ).exists()
        
        print(f"🔍 [BACKEND] Recruteur membre de l'équipe: {is_team_member}")
        
        if not is_team_member:
            print(f"❌ [BACKEND] Recruteur pas membre de l'équipe")
            return Response({
                'error': 'Ce recruteur ne fait pas partie de l\'équipe'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer TOUS les créneaux du forum d'abord
        all_forum_slots = VirtualAgendaSlot.objects.filter(forum=forum)
        print(f"🔍 [BACKEND] Tous les créneaux du forum: {all_forum_slots.count()}")
        
        if all_forum_slots.exists():
            for slot in all_forum_slots:
                print(f"  - Créneau ID: {slot.id}, Recruteur: {slot.recruiter.id} ({slot.recruiter}), Date: {slot.date}")
        
        # CORRECTION: Vérifier que le recruteur est bien un recruteur
        if recruiter.role == 'candidate' or hasattr(recruiter, 'candidate_profile'):
            print(f"❌ [BACKEND] L'utilisateur {recruiter} est un candidat, pas un recruteur")
            return Response({
                'error': 'L\'utilisateur spécifié n\'est pas un recruteur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        slots = VirtualAgendaSlot.objects.filter(
            forum=forum,
            recruiter=recruiter
        ).order_by('date', 'start_time')
        
        print(f"🔍 [BACKEND] Créneaux du recruteur {recruiter_id}: {slots.count()}")
        
        if slots.exists():
            for slot in slots:
                print(f"  - Créneau: {slot.id}, Date: {slot.date}, Heure: {slot.start_time}-{slot.end_time}, Statut: {slot.status}")
        else:
            print(f"❌ [BACKEND] Aucun créneau trouvé pour ce recruteur")
        
        serializer = VirtualAgendaSlotSerializer(slots, many=True)
        print(f"🔍 [BACKEND] Données sérialisées: {len(serializer.data)} éléments")
        
        print(f"🔍 [BACKEND] === FIN RÉCUPÉRATION CRÉNEAUX RECRUTEUR ===")
        return Response(serializer.data)
        
    except Exception as e:
        print(f"❌ [BACKEND] Erreur lors de la récupération des créneaux: {e}")
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
        
        print(f"🔍 [BACKEND] Slots après rafraîchissement: {slots.count()}")
        for slot in slots:
            print(f"  - ID: {slot.id}, Status: {slot.status}, Candidate: {slot.candidate}")
        
        return Response({
            'message': 'Agenda rafraîchi avec succès',
            'slots_count': slots.count()
        })
        
    except Exception as e:
        print(f"❌ [BACKEND] Erreur lors du rafraîchissement: {e}")
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
        
        print(f"🔍 [BACKEND] Recruteurs du forum {forum_id}: {recruiters.count()}")
        
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
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Statistiques globales - CORRECTION: Exclure les créneaux des candidats
        base_queryset = VirtualAgendaSlot.objects.filter(forum=forum).exclude(
            recruiter__role='candidate'
        ).exclude(
            recruiter__candidate_profile__isnull=False
        )
        
        total_slots = base_queryset.count()
        available_slots = base_queryset.filter(status='available').count()
        booked_slots = base_queryset.filter(status='booked').count()
        completed_slots = base_queryset.filter(status='completed').count()
        cancelled_slots = base_queryset.filter(status='cancelled').count()
        
        # Statistiques par recruteur - CORRECTION: Filtrer uniquement les vrais recruteurs
        recruiter_stats = []
        recruiters = User.objects.filter(
            Q(recruiter__company=forum.company) | 
            Q(recruiter__forums=forum)
        ).exclude(
            role='candidate'
        ).exclude(
            candidate_profile__isnull=False
        ).distinct()
        
        for recruiter in recruiters:
            # Vérifier que c'est bien un recruteur
            if recruiter.role != 'candidate' and not hasattr(recruiter, 'candidate_profile'):
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
