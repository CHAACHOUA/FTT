from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from recruiters.models import Meeting, RecruiterForumParticipation
from candidates.models import Candidate
from forums.models import ForumRegistration
from forums.serializers import ForumCandidateSerializer
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_meeting_view(request):
    """
    Route de test pour vérifier que le routing fonctionne.
    """
    return Response({"message": "Route de test des rencontres fonctionnelle"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_meeting_candidates_view(request):
    forum_id = request.query_params.get('forum')
    user = request.user

    if not forum_id:
        return Response({'detail': 'Paramètre "forum" manquant.'}, status=400)

    if not hasattr(user, 'recruiter_profile'):
        return Response({"error": "Accès réservé aux recruteurs."}, status=status.HTTP_403_FORBIDDEN)

    recruiter = user.recruiter_profile

    is_participant = RecruiterForumParticipation.objects.filter(
        recruiter=recruiter,
        forum_id=forum_id
    ).exists()

    if not is_participant:
        return Response({"error": "Vous n'êtes pas autorisé à accéder à ce forum."}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Récupère tous les meetings du forum
        meetings = Meeting.objects.filter(forum_id=forum_id).select_related('candidate__user')

        # Pour chaque meeting, on récupère l'inscription ForumRegistration du candidat
        registrations = ForumRegistration.objects.filter(
            forum_id=forum_id,
            candidate__in=[m.candidate for m in meetings]
        ).select_related('candidate__user', 'search')

        # Sérialise la liste complète d'objets ForumRegistration
        serializer = ForumCandidateSerializer(registrations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        print("Erreur lors du chargement des candidats meeting:", e)
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_meeting_candidate_view(request):
    """
    Ajoute un candidat aux rencontres d'un recruteur pour un forum spécifique.
    """
    user = request.user
    
    if not hasattr(user, 'recruiter_profile'):
        return Response({"error": "Accès réservé aux recruteurs."}, status=status.HTTP_403_FORBIDDEN)

    recruiter = user.recruiter_profile
    
    # Debug: Afficher les données reçues
    print("=== DEBUG ADD MEETING ===")
    print("Request data:", request.data)
    print("Content-Type:", request.content_type)
    print("========================")
    
    # Récupérer les données depuis request.data (DRF)
    candidate_public_token = request.data.get('candidate_public_token')
    forum_id = request.data.get('forum_id')

    print(f"candidate_public_token: {candidate_public_token}")
    print(f"forum_id: {forum_id}")

    if not candidate_public_token:
        return Response({
            'detail': 'Paramètre "candidate_public_token" manquant.',
            'debug': {
                'request_data': str(request.data),
                'content_type': request.content_type
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not forum_id:
        return Response({
            'detail': 'Paramètre "forum_id" manquant.',
            'debug': {
                'request_data': str(request.data),
                'content_type': request.content_type
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier que le recruteur participe au forum
    is_participant = RecruiterForumParticipation.objects.filter(
        recruiter=recruiter,
        forum_id=forum_id
    ).exists()

    if not is_participant:
        return Response({"error": "Vous n'êtes pas autorisé à accéder à ce forum."}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Vérifier que le candidat existe et est inscrit au forum
        candidate = get_object_or_404(Candidate, public_token=candidate_public_token)
        
        # Vérifier que le candidat est inscrit au forum
        forum_registration = ForumRegistration.objects.filter(
            candidate=candidate,
            forum_id=forum_id
        ).first()

        if not forum_registration:
            return Response(
                {"error": "Ce candidat n'est pas inscrit à ce forum."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier qu'il n'y a pas déjà une rencontre pour ce candidat/recruteur/forum
        existing_meeting = Meeting.objects.filter(
            candidate=candidate,
            recruiter=recruiter,
            forum_id=forum_id
        ).first()

        if existing_meeting:
            return Response(
                {"error": "Une rencontre avec ce candidat existe déjà."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer la nouvelle rencontre
        meeting = Meeting.objects.create(
            candidate=candidate,
            recruiter=recruiter,
            forum_id=forum_id,
            company=recruiter.company
        )

        return Response(
            {
                "message": "Candidat ajouté aux rencontres avec succès.",
                "meeting_id": meeting.id
            }, 
            status=status.HTTP_201_CREATED
        )

    except Candidate.DoesNotExist:
        return Response(
            {"error": "Candidat introuvable avec ce public_token."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print("Erreur lors de l'ajout du candidat aux rencontres:", e)
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_meeting_candidate_view(request, candidate_public_token):
    """
    Supprime un candidat des rencontres d'un recruteur pour un forum spécifique.
    """
    user = request.user
    
    if not hasattr(user, 'recruiter_profile'):
        return Response({"error": "Accès réservé aux recruteurs."}, status=status.HTTP_403_FORBIDDEN)

    recruiter = user.recruiter_profile
    forum_id = request.query_params.get('forum')

    if not forum_id:
        return Response({'detail': 'Paramètre "forum" manquant.'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier que le recruteur participe au forum
    is_participant = RecruiterForumParticipation.objects.filter(
        recruiter=recruiter,
        forum_id=forum_id
    ).exists()

    if not is_participant:
        return Response({"error": "Vous n'êtes pas autorisé à accéder à ce forum."}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Vérifier que le candidat existe
        candidate = get_object_or_404(Candidate, public_token=candidate_public_token)
        
        # Trouver et supprimer la rencontre
        meeting = Meeting.objects.filter(
            candidate=candidate,
            recruiter=recruiter,
            forum_id=forum_id
        ).first()

        if not meeting:
            return Response(
                {"error": "Aucune rencontre trouvée avec ce candidat."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        meeting.delete()

        return Response(
            {"message": "Candidat retiré des rencontres avec succès."}, 
            status=status.HTTP_200_OK
        )

    except Candidate.DoesNotExist:
        return Response(
            {"error": "Candidat introuvable avec ce public_token."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print("Erreur lors de la suppression du candidat des rencontres:", e)
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_add_meeting_view(request):
    """
    Route de test pour vérifier la réception des données.
    """
    print("=== TEST ADD MEETING ===")
    print("Request data:", request.data)
    print("Content-Type:", request.content_type)
    print("Headers:", dict(request.headers))
    print("========================")
    
    return Response({
        "message": "Test réussi",
        "received_data": request.data,
        "content_type": request.content_type
    }, status=status.HTTP_200_OK)
