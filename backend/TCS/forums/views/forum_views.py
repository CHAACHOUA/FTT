from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from forums.services.forum_services import get_all_forums, get_forum_detail
from rest_framework.response import Response
from forums.services.forum_services import get_candidate_search_by_forum_and_candidate
from forums.serializers import CandidateSearchSerializer

from candidates.models import Candidate


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