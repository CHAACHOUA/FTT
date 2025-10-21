from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ..models import VirtualApplication, VirtualAgendaSlot
from ..serializers import VirtualApplicationSerializer, VirtualApplicationCreateSerializer
from forums.models import Forum
from recruiters.models import Offer


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
        print(f"🔍 [BACKEND] Utilisateur: {request.user}")
        print(f"🔍 [BACKEND] Données brutes: {request.data}")
        print(f"🔍 [BACKEND] Headers: {dict(request.headers)}")
        
        try:
            response = super().post(request, *args, **kwargs)
            print(f"✅ [BACKEND] Candidature créée avec succès: {response.data}")
            return response
        except Exception as e:
            print(f"❌ [BACKEND] Erreur lors de la création: {e}")
            print(f"❌ [BACKEND] Type d'erreur: {type(e)}")
            raise
    
    def get_queryset(self):
        user = self.request.user
        forum_id = self.request.query_params.get('forum_id')
        
        # Les candidats voient leurs propres candidatures
        if hasattr(user, 'candidate_profile'):
            queryset = VirtualApplication.objects.filter(candidate=user)
            if forum_id:
                queryset = queryset.filter(forum_id=forum_id)
            return queryset.select_related('offer', 'offer__company', 'selected_slot')
        
        # Les recruteurs voient les candidatures pour leurs offres
        elif hasattr(user, 'recruiter_profile'):
            queryset = VirtualApplication.objects.filter(
                offer__recruiter=user.recruiter_profile
            )
            if forum_id:
                queryset = queryset.filter(forum_id=forum_id)
            return queryset.select_related('candidate', 'offer', 'selected_slot')
        
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
            return VirtualApplication.objects.filter(candidate=user)
        
        # Les recruteurs peuvent voir les candidatures pour leurs offres
        elif hasattr(user, 'recruiter_profile'):
            return VirtualApplication.objects.filter(
                offer__recruiter=user.recruiter_profile
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
    
    serializer = VirtualApplicationSerializer(applications, many=True)
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
        offer__recruiter=request.user.recruiter_profile,
        forum=forum
    ).select_related('candidate', 'offer', 'selected_slot')
    
    serializer = VirtualApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_application(request, application_id):
    """
    Valider une candidature (recruteur accepte et réserve le slot)
    """
    if not hasattr(request.user, 'recruiter_profile'):
        return Response(
            {'detail': 'Seuls les recruteurs peuvent valider les candidatures.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        application = VirtualApplication.objects.get(id=application_id)
    except VirtualApplication.DoesNotExist:
        return Response(
            {'detail': 'Candidature non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que le recruteur est bien le propriétaire de l'offre
    if application.offer.recruiter != request.user.recruiter_profile:
        return Response(
            {'detail': 'Vous ne pouvez valider que les candidatures pour vos propres offres.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que la candidature est en attente
    if application.status != 'pending':
        return Response(
            {'detail': 'Cette candidature a déjà été traitée.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Réserver le slot si sélectionné
    if application.selected_slot:
        slot = application.selected_slot
        print(f"🔍 [BACKEND] Slot avant validation: ID={slot.id}, Status={slot.status}, Candidate={slot.candidate}")
        
        if slot.status != 'available':
            return Response(
                {'detail': 'Ce créneau n\'est plus disponible.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mettre à jour le slot
        slot.status = 'booked'
        slot.candidate = application.candidate
        slot.save()
        
        # Forcer la mise à jour du cache Django
        slot.refresh_from_db()
        
        print(f"✅ [BACKEND] Slot mis à jour: ID={slot.id}, Status={slot.status}, Candidate={slot.candidate}")
        print(f"✅ [BACKEND] Slot réservé pour la candidature validée: {slot}")
        
        # Simple mise à jour du slot
        print(f"✅ [BACKEND] Slot mis à jour avec succès")
    else:
        print(f"ℹ️ [BACKEND] Aucun slot sélectionné pour cette candidature")
    
    # Mettre à jour le statut de la candidature
    application.status = 'accepted'
    application.save()
    
    print(f"✅ [BACKEND] Candidature validée: {application}")
    print(f"✅ [BACKEND] Statut final: {application.status}")
    
    # Vérifier l'état final du slot après validation
    if application.selected_slot:
        # Rafraîchir l'objet depuis la base de données pour s'assurer d'avoir les dernières données
        application.selected_slot.refresh_from_db()
        slot_after = application.selected_slot
        print(f"🔍 [BACKEND] État final du slot: ID={slot_after.id}, Status={slot_after.status}, Candidate={slot_after.candidate}")
    
    # Rafraîchir aussi l'application depuis la base de données
    application.refresh_from_db()
    print(f"🔍 [BACKEND] Application rafraîchie: Status={application.status}")
    
    # Retourner les données mises à jour avec un flag pour indiquer la mise à jour
    serializer = VirtualApplicationSerializer(application)
    response_data = serializer.data
    response_data['slot_updated'] = True
    response_data['slot_id'] = application.selected_slot.id if application.selected_slot else None
    
    print(f"✅ [BACKEND] Réponse avec données mises à jour: {response_data}")
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
    
    # Vérifier que le recruteur est bien le propriétaire de l'offre
    if application.offer.recruiter != request.user.recruiter_profile:
        return Response(
            {'detail': 'Vous ne pouvez rejeter que les candidatures pour vos propres offres.'},
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
    
    print(f"✅ [BACKEND] Candidature rejetée: {application}")
    print(f"ℹ️ [BACKEND] Slot non modifié (reste disponible): {application.selected_slot}")
    
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
