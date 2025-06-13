from recruiters.models import Offer, FavoriteOffer
from django.shortcuts import get_object_or_404
from recruiters.serializers import OfferSerializer


def toggle_favorite_offer(candidate, offer_id):
    """
    Ajoute ou retire une offre des favoris du candidat.
    Retourne un dictionnaire avec le statut de l'action.
    """
    offer = get_object_or_404(Offer, id=offer_id)

    favorite, created = FavoriteOffer.objects.get_or_create(candidate=candidate, offer=offer)
    if not created:
        favorite.delete()
        return {'status': 'unliked'}
    return {'status': 'liked'}
def get_favorite_offers(candidate):
    favorites = FavoriteOffer.objects.filter(candidate=candidate).select_related('offer')
    offers = [fav.offer for fav in favorites]
    return OfferSerializer(offers, many=True).data

