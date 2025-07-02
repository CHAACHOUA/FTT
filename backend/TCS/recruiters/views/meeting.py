from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from recruiters.models import Meeting

from forums.serializers import ForumCandidateSerializer

from forums.models import ForumRegistration

from recruiters.models import RecruiterForumParticipation

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
