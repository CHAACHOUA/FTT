from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist

from candidates.models import Candidate
from recruiters.services.offers_service import toggle_favorite_offer, get_favorite_offers


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_offer_view(request, offer_id):
    """
    Vue API pour liker / disliker une offre.
    """
    try:
        candidate = Candidate.objects.get(user=request.user)
    except ObjectDoesNotExist:
        return Response({'detail': "Profil candidat introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = toggle_favorite_offer(candidate, offer_id)
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorite_offers_view(request):
    """
    Récupère toutes les offres favorites du candidat.
    """
    try:
        candidate = Candidate.objects.get(user=request.user)
    except Candidate.DoesNotExist:
        return Response({'detail': 'Profil candidat introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        offers_data = get_favorite_offers(candidate)
        return Response(offers_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
