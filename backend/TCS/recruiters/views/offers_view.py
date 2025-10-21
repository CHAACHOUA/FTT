from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from candidates.models import Candidate
from recruiters.services.offers_service import toggle_favorite_offer
from recruiters.services.offers_service import get_favorite_offers
from recruiters.serializers import OfferWriteSerializer,OfferSerializer
from recruiters.services.offers_service import update_offer_service, delete_offer_service, \
    create_offer_service,get_offers_by_recruiter_company

from recruiters.models import Recruiter


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_offers_list(request):
    recruiter = Recruiter.objects.get(user=request.user)
    forum_id = request.query_params.get('forum_id')
    offers = get_offers_by_recruiter_company(recruiter,forum_id)
    serializer = OfferSerializer(offers, many=True)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_offer(request):
    user = request.user
    if not hasattr(user, 'recruiter_profile'):
        return Response({'detail': 'Seuls les recruteurs peuvent créer une offre.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = OfferWriteSerializer(data=request.data)
    print("Request data:", request.data)
    if serializer.is_valid():
        try:
            offer = create_offer_service(user.recruiter_profile, serializer.validated_data)
            return Response(OfferSerializer(offer).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_offer(request, offer_id):
    print(f"=== UPDATE OFFER CALLED === offer_id: {offer_id}")
    print(f"Request method: {request.method}")
    print(f"Request data: {request.data}")
    
    user = request.user
    print(f"User: {user}, Has recruiter_profile: {hasattr(user, 'recruiter_profile')}")
    
    if not hasattr(user, 'recruiter_profile'):
        return Response({'detail': 'Seuls les recruteurs peuvent modifier une offre.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = OfferWriteSerializer(data=request.data, partial=True)
    if serializer.is_valid():
        try:
            offer = update_offer_service(user.recruiter_profile, offer_id, serializer.validated_data)
            print(f"Offre mise à jour avec succès: {offer.id}")
            return Response(OfferSerializer(offer).data)
        except ValidationError as e:
            print(f"Erreur de validation: {e}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        print(f"Serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_offer(request, offer_id):
    user = request.user
    if not hasattr(user, 'recruiter_profile'):
        return Response({'detail': 'Seuls les recruteurs peuvent supprimer une offre.'}, status=status.HTTP_403_FORBIDDEN)

    delete_offer_service(user.recruiter_profile, offer_id)
    return Response({'detail': 'Offre supprimée avec succès.'}, status=status.HTTP_204_NO_CONTENT)