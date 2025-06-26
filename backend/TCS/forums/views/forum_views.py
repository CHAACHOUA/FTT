from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from forums.services.forum_services import get_all_forums, get_forum_detail
from rest_framework.response import Response
from forums.services.forum_services import get_candidate_search_by_forum_and_candidate
from forums.serializers import CandidateSearchSerializer
from candidates.models import Candidate
from forums.services.forum_candidate_participation import get_candidates_for_forum
from recruiters.models import RecruiterForumParticipation
from forums.serializers import ForumCandidateSerializer


@api_view(['GET'])
def forum_list(request):
    return get_all_forums()


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def forum_detail(request, pk):
    return get_forum_detail(pk)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_search_view(request, forum_id):
    """
    Vue API pour récupérer les préférences de recherche d’un candidat pour un forum donné.
    """
    user=request.user
    try:
        candidate = Candidate.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({
            "message": "Profil candidat introuvable."
        }, status=status.HTTP_404_NOT_FOUND)
    try:
        search = get_candidate_search_by_forum_and_candidate(forum_id, candidate)
        if search:
            serializer = CandidateSearchSerializer(search)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Aucune préférence enregistrée."}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_candidates(request, forum_id):
    user = request.user

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
        registrations = get_candidates_for_forum(forum_id)
        serializer = ForumCandidateSerializer(registrations, many=True)
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
