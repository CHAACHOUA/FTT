from recruiters.models import Offer, FavoriteOffer
from django.shortcuts import get_object_or_404
from recruiters.serializers import OfferSerializer
from company.models import ForumCompany
from django.core.exceptions import ValidationError


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

def get_offers_by_recruiter_company(recruiter, forum_id):
    company = recruiter.company
    return Offer.objects.filter(company=company, forum_id=forum_id).select_related('company', 'recruiter')

def create_offer_service(recruiter, data):
    """
    Crée une offre en vérifiant que l'entreprise participe au forum
    """
    company = recruiter.company
    forum = data.get('forum')
    
    if not forum:
        raise ValidationError("Le forum est requis pour créer une offre.")
    
    # Vérifier que l'entreprise participe au forum
    if not ForumCompany.objects.filter(company=company, forum=forum).exists():
        raise ValidationError(
            f"L'entreprise '{company.name}' ne participe pas au forum '{forum.name}'. "
            f"Veuillez d'abord ajouter l'entreprise au forum."
        )
    
    print(f"Création d'une offre pour {company.name} dans le forum {forum.name}")
    return Offer.objects.create(
        recruiter=recruiter,
        company=company,
        **data
    )

def update_offer_service(recruiter, offer_id, data):
    offer = get_object_or_404(Offer, id=offer_id, recruiter=recruiter)
    company = recruiter.company
    
    # Si le forum est modifié, vérifier que l'entreprise participe au nouveau forum
    if 'forum' in data:
        new_forum = data['forum']
        if not ForumCompany.objects.filter(company=company, forum=new_forum).exists():
            raise ValidationError(
                f"L'entreprise '{company.name}' ne participe pas au forum '{new_forum.name}'. "
                f"Veuillez d'abord ajouter l'entreprise au forum."
            )
    
    for field, value in data.items():
        setattr(offer, field, value)
    offer.save()
    return offer

def delete_offer_service(recruiter, offer_id):
    offer = get_object_or_404(Offer, id=offer_id, recruiter=recruiter)
    offer.delete()