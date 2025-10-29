from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
import logging
from ..models import VirtualApplication, VirtualAgendaSlot
from ..services.zoom_service import ZoomService
from ..serializers import VirtualApplicationSerializer, VirtualApplicationCreateSerializer
from forums.models import Forum
from recruiters.models import Offer

# Configuration du logger
logger = logging.getLogger(__name__)


class VirtualApplicationListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des candidatures virtuelles
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VirtualApplicationCreateSerializer
        return VirtualApplicationSerializer
    
    def post(self, request, *args, **kwargs):
        print(f"🔍 [BACKEND] POST /api/virtual/applications/ reçu")
        print(f"🔍 [BACKEND] Données reçues: {request.data}")
        print(f"🔍 [BACKEND] selected_slot: {request.data.get('selected_slot')}")
        print(f"🔍 [BACKEND] questionnaire_responses: {request.data.get('questionnaire_responses')}")
        
        try:
            response = super().post(request, *args, **kwargs)
            print(f"✅ [BACKEND] Candidature créée avec succès: {response.data}")
            return response
        except Exception as e:
            print(f"❌ [BACKEND] Erreur lors de la création: {e}")
            raise
    
    def get_queryset(self):
        user = self.request.user
        forum_id = self.request.query_params.get('forum_id')
        
        # Les candidats voient leurs propres candidatures
        if hasattr(user, 'candidate_profile'):
            queryset = VirtualApplication.objects.filter(candidate=user)
            if forum_id:
                queryset = queryset.filter(forum_id=forum_id)
            return queryset.select_related(
                'offer', 
                'offer__company', 
                'offer__recruiter', 
                'offer__recruiter__user',
                'selected_slot',
                'selected_slot__recruiter',
                'forum'
            )
        
        # Les recruteurs voient les candidatures pour leurs offres ET les candidatures avec leurs créneaux
        elif hasattr(user, 'recruiter_profile'):
            queryset = VirtualApplication.objects.filter(
                Q(offer__recruiter=user.recruiter_profile) |  # Candidatures pour leurs offres
                Q(selected_slot__recruiter=user)  # Candidatures avec leurs créneaux
            )
            if forum_id:
                queryset = queryset.filter(forum_id=forum_id)
            
            queryset = queryset.select_related(
                'candidate', 
                'candidate__candidate_profile',
                'offer', 
                'offer__company',
                'offer__recruiter',
                'offer__recruiter__user',
                'selected_slot',
                'selected_slot__recruiter',
                'forum'
            )
            
            return queryset
        
        return VirtualApplication.objects.none()


class VirtualApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une candidature virtuelle
    """
    permission_classes = [IsAuthenticated]
    serializer_class = VirtualApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Les candidats peuvent voir/modifier leurs propres candidatures
        if hasattr(user, 'candidate_profile'):
            return VirtualApplication.objects.filter(candidate=user).select_related(
                'offer', 
                'offer__company', 
                'offer__recruiter', 
                'offer__recruiter__user',
                'selected_slot',
                'selected_slot__recruiter',
                'forum'
            )
        
        # Les recruteurs peuvent voir les candidatures pour leurs offres ET les candidatures avec leurs créneaux
        elif hasattr(user, 'recruiter_profile'):
            return VirtualApplication.objects.filter(
                Q(offer__recruiter=user.recruiter_profile) |  # Candidatures pour leurs offres
                Q(selected_slot__recruiter=user)  # Candidatures avec leurs créneaux
            ).select_related(
                'candidate',
                'candidate__candidate_profile',
                'offer', 
                'offer__company',
                'offer__recruiter',
                'offer__recruiter__user',
                'selected_slot',
                'selected_slot__recruiter',
                'forum'
            )
        
        return VirtualApplication.objects.none()
    
    def perform_destroy(self, instance):
        """Annuler la réservation du créneau si nécessaire"""
        if instance.selected_slot and instance.selected_slot.candidate == instance.candidate:
            instance.selected_slot.status = 'available'
            instance.selected_slot.candidate = None
            instance.selected_slot.save()
        
        instance.delete()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_applications(request, forum_id):
    """
    Récupère les candidatures d'un candidat pour un forum spécifique
    """
    if not hasattr(request.user, 'candidate_profile'):
        return Response(
            {'detail': 'Seuls les candidats peuvent accéder à cette ressource.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        forum = Forum.objects.get(id=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'detail': 'Forum non trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    applications = VirtualApplication.objects.filter(
        candidate=request.user,
        forum=forum
    ).select_related('offer', 'offer__company', 'selected_slot')
    
    serializer = VirtualApplicationSerializer(applications, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recruiter_applications(request, forum_id):
    """
    Récupère les candidatures reçues par un recruteur pour un forum spécifique
    """
    if not hasattr(request.user, 'recruiter_profile'):
        return Response(
            {'detail': 'Seuls les recruteurs peuvent accéder à cette ressource.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        forum = Forum.objects.get(id=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'detail': 'Forum non trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    applications = VirtualApplication.objects.filter(
        Q(offer__recruiter=request.user.recruiter_profile) |  # Candidatures pour leurs offres
        Q(selected_slot__recruiter=request.user),  # Candidatures avec leurs créneaux
        forum=forum
    ).select_related('candidate', 'offer', 'selected_slot')
    
    serializer = VirtualApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_interview_status(request, application_id):
    """
    Met à jour le statut d'un entretien (scheduled, inProgress, completed)
    """
    logger.info(f"🔄 Mise à jour du statut d'entretien pour l'application {application_id}")
    logger.info(f"🔍 Utilisateur: {request.user.email}")
    logger.info(f"🔍 Données reçues: {request.data}")
    
    try:
        application = VirtualApplication.objects.get(id=application_id)
        logger.info(f"✅ Application trouvée: {application.id}")
        
        # Vérifier les permissions
        if request.user.id != application.candidate.id and request.user.id != application.selected_slot.recruiter.id:
            logger.warning(f"❌ Permission refusée: utilisateur {request.user.id} n'est ni le candidat ni le recruteur")
            return Response(
                {'error': 'Permission refusée'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if not new_status:
            logger.error("❌ Statut manquant dans la requête")
            return Response(
                {'error': 'Le statut est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['scheduled', 'inProgress', 'completed']:
            logger.error(f"❌ Statut invalide: {new_status}")
            return Response(
                {'error': 'Statut invalide'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mettre à jour le statut
        application.interview_status = new_status
        application.save()
        
        logger.info(f"✅ Statut d'entretien mis à jour: {new_status}")
        
        return Response({
            'message': 'Statut d\'entretien mis à jour avec succès',
            'interview_status': new_status
        }, status=status.HTTP_200_OK)
        
    except VirtualApplication.DoesNotExist:
        logger.error(f"❌ Application {application_id} non trouvée")
        return Response(
            {'error': 'Application non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"❌ Erreur lors de la mise à jour du statut: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Erreur interne du serveur'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_application(request, application_id):
    """
    Valider une candidature (recruteur accepte et réserve le slot)
    """
    logger.info(f"🔍 validate_application called for application_id: {application_id}")
    logger.info(f"🔍 Request user: {request.user}")
    logger.info(f"🔍 Request data: {request.data}")
    
    if not hasattr(request.user, 'recruiter_profile'):
        logger.error(f"❌ User {request.user} is not a recruiter")
        return Response(
            {'detail': 'Seuls les recruteurs peuvent valider les candidatures.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        application = VirtualApplication.objects.get(id=application_id)
        logger.info(f"🔍 Application found: {application}")
        logger.info(f"🔍 Application status: {application.status}")
        logger.info(f"🔍 Application offer: {application.offer}")
        logger.info(f"🔍 Application selected_slot: {application.selected_slot}")
        logger.info(f"🔍 Application candidate: {application.candidate}")
    except VirtualApplication.DoesNotExist:
        logger.error(f"❌ Application {application_id} not found")
        return Response(
            {'detail': 'Candidature non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que le recruteur est bien le propriétaire de l'offre OU du créneau
    logger.info(f"🔍 Checking permissions...")
    logger.info(f"🔍 Offer recruiter: {application.offer.recruiter}")
    logger.info(f"🔍 Request user recruiter profile: {request.user.recruiter_profile}")
    logger.info(f"🔍 Selected slot recruiter: {application.selected_slot.recruiter if application.selected_slot else None}")
    
    if (application.offer.recruiter != request.user.recruiter_profile and 
        (not application.selected_slot or application.selected_slot.recruiter != request.user)):
        logger.error(f"❌ Permission denied: User cannot validate this application")
        return Response(
            {'detail': 'Vous ne pouvez valider que les candidatures pour vos propres offres ou créneaux.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que la candidature est en attente
    if application.status != 'pending':
        logger.error(f"❌ Application already processed: status={application.status}")
        return Response(
            {'detail': 'Cette candidature a déjà été traitée.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    logger.info(f"✅ Permission check passed, processing validation...")
    
    # Réserver le slot si sélectionné
    if application.selected_slot:
        slot = application.selected_slot
        logger.info(f"🔍 Processing slot reservation for slot: {slot}")
        logger.info(f"🔍 Slot status: {slot.status}")
        
        # Autoriser la validation si le créneau est déjà réservé par le même candidat (idempotent)
        if slot.status == 'booked':
            if slot.candidate_id == getattr(application.candidate, 'id', None):
                logger.info("ℹ️ Slot already booked by the same candidate – proceeding to accept application without changing slot.")
            else:
                logger.error(f"❌ Slot not available: status=booked by another candidate (slot.candidate_id={slot.candidate_id}, application.candidate_id={getattr(application.candidate, 'id', None)})")
                return Response(
                    {'detail': "Ce créneau est déjà réservé par un autre candidat."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif slot.status != 'available':
            logger.error(f"❌ Slot not available: status={slot.status}")
            return Response(
                {'detail': 'Ce créneau n\'est plus disponible.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Mettre à jour le slot
            logger.info(f"🔍 Updating slot status to 'booked'...")
            slot.status = 'booked'
            slot.candidate = application.candidate
            slot.save()
            logger.info(f"✅ Slot updated successfully")
            
            # Forcer la mise à jour du cache Django
            slot.refresh_from_db()
            logger.info(f"🔍 Slot refreshed from DB: {slot}")
    else:
        logger.info(f"🔍 No slot selected for this application")
        pass  # Aucun slot sélectionné pour cette candidature
    
    # Créer automatiquement le lien Zoom si nécessaire
    if application.selected_slot:
        slot = application.selected_slot
        try:
            if slot.type == 'video' and not slot.meeting_link:
                logger.info("🔗 Creating Zoom meeting for booked video slot...")
                logger.info(f"🔍 Slot details: ID={slot.id}, Date={slot.date}, Time={slot.start_time}-{slot.end_time}")
                logger.info(f"🔍 Recruiter: {slot.recruiter.email}, Candidate: {slot.candidate.email if slot.candidate else 'None'}")
                
                zoom_service = ZoomService()
                meeting_info = zoom_service.create_meeting(slot)
                
                logger.info(f"🔗 Zoom meeting created successfully!")
                logger.info(f"🔗 Meeting ID: {meeting_info.get('meeting_id', 'N/A')}")
                logger.info(f"🔗 Meeting Link: {meeting_info['meeting_link']}")
                logger.info(f"🔗 Host Link: {meeting_info.get('host_link', 'N/A')}")
                logger.info(f"🔗 Meeting Topic: {meeting_info.get('topic', 'N/A')}")
                logger.info(f"🔗 Meeting Duration: {meeting_info.get('duration', 'N/A')} minutes")
                
                slot.meeting_link = meeting_info['meeting_link']
                slot.save()
                
                logger.info(f"✅ Slot updated with meeting link: {slot.meeting_link}")
            else:
                logger.info(f"ℹ️ No Zoom meeting creation needed: type={slot.type}, has_link={bool(slot.meeting_link)}")
        except Exception as e:
            logger.error(f"❌ Failed to create Zoom meeting: {str(e)}", exc_info=True)
            logger.error(f"❌ Error details: {type(e).__name__}: {str(e)}")

    # Mettre à jour le statut de la candidature
    logger.info(f"🔍 Updating application status to 'accepted'...")
    application.status = 'accepted'
    application.save()
    logger.info(f"✅ Application status updated")
    
    # Vérifier l'état final du slot après validation
    if application.selected_slot:
        # Rafraîchir l'objet depuis la base de données pour s'assurer d'avoir les dernières données
        application.selected_slot.refresh_from_db()
        logger.info(f"🔍 Final slot state: {application.selected_slot}")
    
    # Rafraîchir aussi l'application depuis la base de données
    application.refresh_from_db()
    logger.info(f"🔍 Final application state: {application}")
    
    # Retourner les données mises à jour avec un flag pour indiquer la mise à jour
    serializer = VirtualApplicationSerializer(application)
    response_data = serializer.data
    response_data['slot_updated'] = True
    response_data['slot_id'] = application.selected_slot.id if application.selected_slot else None
    
    logger.info(f"✅ Validation completed successfully")
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_application(request, application_id):
    """
    Rejeter une candidature
    """
    if not hasattr(request.user, 'recruiter_profile'):
        return Response(
            {'detail': 'Seuls les recruteurs peuvent rejeter les candidatures.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        application = VirtualApplication.objects.get(id=application_id)
    except VirtualApplication.DoesNotExist:
        return Response(
            {'detail': 'Candidature non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que le recruteur est bien le propriétaire de l'offre OU du créneau
    if (application.offer.recruiter != request.user.recruiter_profile and 
        (not application.selected_slot or application.selected_slot.recruiter != request.user)):
        return Response(
            {'detail': 'Vous ne pouvez rejeter que les candidatures pour vos propres offres ou créneaux.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que la candidature est en attente
    if application.status != 'pending':
        return Response(
            {'detail': 'Cette candidature a déjà été traitée.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mettre à jour le statut de la candidature (sans modifier le slot)
    application.status = 'rejected'
    application.save()
    
    
    serializer = VirtualApplicationSerializer(application)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    """
    Met à jour le statut d'une candidature (pour les recruteurs)
    """
    if not hasattr(request.user, 'recruiter_profile'):
        return Response(
            {'detail': 'Seuls les recruteurs peuvent modifier le statut.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        application = VirtualApplication.objects.get(
            id=application_id,
            offer__recruiter=request.user.recruiter_profile
        )
    except VirtualApplication.DoesNotExist:
        return Response(
            {'detail': 'Candidature non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_status = request.data.get('status')
    notes = request.data.get('notes', '')
    
    if new_status not in [choice[0] for choice in VirtualApplication.STATUS_CHOICES]:
        return Response(
            {'detail': 'Statut invalide.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    application.status = new_status
    application.notes = notes
    application.save()
    
    serializer = VirtualApplicationSerializer(application)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_stats(request, forum_id):
    """
    Récupère les statistiques des candidatures pour un forum
    """
    try:
        forum = Forum.objects.get(id=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'detail': 'Forum non trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if hasattr(request.user, 'candidate_profile'):
        # Statistiques pour le candidat
        applications = VirtualApplication.objects.filter(
            candidate=request.user,
            forum=forum
        )
        
        stats = {
            'total': applications.count(),
            'pending': applications.filter(status='pending').count(),
            'reviewed': applications.filter(status='reviewed').count(),
            'accepted': applications.filter(status='accepted').count(),
            'rejected': applications.filter(status='rejected').count(),
        }
    
    elif hasattr(request.user, 'recruiter_profile'):
        # Statistiques pour le recruteur
        applications = VirtualApplication.objects.filter(
            offer__recruiter=request.user.recruiter_profile,
            forum=forum
        )
        
        stats = {
            'total': applications.count(),
            'pending': applications.filter(status='pending').count(),
            'reviewed': applications.filter(status='reviewed').count(),
            'accepted': applications.filter(status='accepted').count(),
            'rejected': applications.filter(status='rejected').count(),
        }
    
    else:
        return Response(
            {'detail': 'Accès non autorisé.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response(stats)
