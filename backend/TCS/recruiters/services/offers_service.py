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
    
    # Séparer les données de l'offre et du questionnaire
    offer_data = {}
    questionnaire_data = None
    
    for field, value in data.items():
        if field == 'questionnaire':
            questionnaire_data = value
        else:
            offer_data[field] = value
    
    print(f"Création d'une offre pour {company.name} dans le forum {forum.name}")
    offer = Offer.objects.create(
        recruiter=recruiter,
        company=company,
        **offer_data
    )
    
    # Créer le questionnaire pour les forums virtuels
    from virtual.models import Questionnaire, Question
    
    # Vérifier si c'est un forum virtuel
    if forum.type == 'virtuel' or forum.is_virtual:
        print(f"Forum virtuel détecté: {forum.name}")
        
        questionnaire = Questionnaire.objects.create(
            offer=offer,
            title=questionnaire_data.get('title', 'Questionnaire de candidature') if questionnaire_data else 'Questionnaire de candidature',
            description=questionnaire_data.get('description', '') if questionnaire_data else '',
            is_active=questionnaire_data.get('is_active', True) if questionnaire_data else True,
            is_required=questionnaire_data.get('is_required', True) if questionnaire_data else True
        )
        print(f"Questionnaire créé: {questionnaire.id}")
        
        # Créer les questions si fournies
        print(f"=== CRÉATION DES QUESTIONS ===")
        print(f"questionnaire_data: {questionnaire_data}")
        if questionnaire_data and 'questions' in questionnaire_data:
            print(f"questionnaire_data['questions']: {questionnaire_data['questions']}")
            print(f"Type: {type(questionnaire_data['questions'])}")
            print(f"Length: {len(questionnaire_data['questions']) if questionnaire_data['questions'] else 'None'}")
        
        if questionnaire_data and 'questions' in questionnaire_data and questionnaire_data['questions'] and len(questionnaire_data['questions']) > 0:
            questions_data = questionnaire_data['questions']
            print(f"Questions à créer: {questions_data}")
            for i, question_data in enumerate(questions_data):
                print(f"Création question {i+1}: {question_data}")
                if question_data and isinstance(question_data, dict):
                    try:
                        Question.objects.create(questionnaire=questionnaire, **question_data)
                        print(f"Question {i+1} créée avec succès")
                    except Exception as e:
                        print(f"Erreur lors de la création de la question {i+1}: {e}")
                else:
                    print(f"Question {i+1} ignorée (pas un dict ou vide)")
            print(f"Questionnaire créé avec {questionnaire.questions.count()} questions")
        else:
            print("Questionnaire créé sans questions")
            if questionnaire_data and 'questions' in questionnaire_data:
                print(f"Raison: questions = {questionnaire_data['questions']}")
            else:
                print("Raison: clé 'questions' manquante")
        print(f"=== FIN CRÉATION DES QUESTIONS ===")
    else:
        print(f"Forum non virtuel: {forum.name}, pas de questionnaire créé")
    
    return offer

def update_offer_service(recruiter, offer_id, data):
    print(f"=== UPDATE OFFER SERVICE ===")
    print(f"Recruiter: {recruiter}")
    print(f"Offer ID: {offer_id}")
    print(f"Data: {data}")
    
    # Vérifier si l'offre existe
    try:
        offer = Offer.objects.get(id=offer_id)
        print(f"Offre trouvée: {offer.id}, Recruiter: {offer.recruiter}")
        print(f"Recruiter actuel: {recruiter}")
        print(f"Offre appartient au recruteur: {offer.recruiter == recruiter}")
        print(f"Entreprise de l'offre: {offer.company}")
        print(f"Entreprise du recruteur: {recruiter.company}")
        print(f"Même entreprise: {offer.company == recruiter.company}")
    except Offer.DoesNotExist:
        print(f"Offre {offer_id} n'existe pas")
        raise
    
    # Vérifier que le recruteur appartient à la même entreprise que l'offre
    if offer.company != recruiter.company:
        raise ValidationError("Vous ne pouvez modifier que les offres de votre entreprise.")
    
    company = recruiter.company
    
    # Si le forum est modifié, vérifier que l'entreprise participe au nouveau forum
    if 'forum' in data:
        new_forum = data['forum']
        if not ForumCompany.objects.filter(company=company, forum=new_forum).exists():
            raise ValidationError(
                f"L'entreprise '{company.name}' ne participe pas au forum '{new_forum.name}'. "
                f"Veuillez d'abord ajouter l'entreprise au forum."
            )
    
    # Séparer les données de l'offre et du questionnaire
    offer_data = {}
    questionnaire_data = None
    
    for field, value in data.items():
        if field == 'questionnaire':
            questionnaire_data = value
        else:
            offer_data[field] = value
    
    # Mettre à jour l'offre
    for field, value in offer_data.items():
        setattr(offer, field, value)
    offer.save()
    
    # Gérer le questionnaire pour les forums virtuels
    from virtual.models import Questionnaire, Question
    
    # Vérifier si c'est un forum virtuel
    if offer.forum.type == 'virtuel' or offer.forum.is_virtual:
        print(f"Forum virtuel détecté: {offer.forum.name}")
        
        # Récupérer ou créer le questionnaire
        try:
            questionnaire = Questionnaire.objects.get(offer=offer)
            print(f"Questionnaire existant trouvé: {questionnaire.id}")
            
            # Mettre à jour le questionnaire si des données sont fournies
            if questionnaire_data is not None and questionnaire_data != {}:
                questionnaire.title = questionnaire_data.get('title', questionnaire.title)
                questionnaire.description = questionnaire_data.get('description', questionnaire.description)
                questionnaire.is_active = questionnaire_data.get('is_active', questionnaire.is_active)
                questionnaire.is_required = questionnaire_data.get('is_required', questionnaire.is_required)
                questionnaire.save()
                print(f"Questionnaire mis à jour: {questionnaire.id}")
                
                # Mettre à jour les questions si fournies
                print(f"=== TRAITEMENT DES QUESTIONS ===")
                print(f"questionnaire_data: {questionnaire_data}")
                print(f"'questions' in questionnaire_data: {'questions' in questionnaire_data}")
                if 'questions' in questionnaire_data:
                    print(f"questionnaire_data['questions']: {questionnaire_data['questions']}")
                    print(f"Type: {type(questionnaire_data['questions'])}")
                    print(f"Length: {len(questionnaire_data['questions']) if questionnaire_data['questions'] else 'None'}")
                
                if 'questions' in questionnaire_data and questionnaire_data['questions'] and len(questionnaire_data['questions']) > 0:
                    questions_data = questionnaire_data['questions']
                    print(f"Questions à traiter: {questions_data}")
                    
                    # Supprimer les anciennes questions
                    old_count = questionnaire.questions.count()
                    questionnaire.questions.all().delete()
                    print(f"{old_count} anciennes questions supprimées")
                    
                    # Créer les nouvelles questions
                    for i, question_data in enumerate(questions_data):
                        print(f"Traitement question {i+1}: {question_data}")
                        if question_data and isinstance(question_data, dict):
                            try:
                                Question.objects.create(questionnaire=questionnaire, **question_data)
                                print(f"Question {i+1} créée avec succès")
                            except Exception as e:
                                print(f"Erreur lors de la création de la question {i+1}: {e}")
                        else:
                            print(f"Question {i+1} ignorée (pas un dict ou vide)")
                    
                    print(f"Questionnaire final avec {questionnaire.questions.count()} questions")
                else:
                    print("Aucune question fournie, questionnaire conservé tel quel")
                    if 'questions' in questionnaire_data:
                        print(f"Raison: questions = {questionnaire_data['questions']}")
                    else:
                        print("Raison: clé 'questions' manquante")
                print(f"=== FIN TRAITEMENT DES QUESTIONS ===")
            else:
                print("Aucune donnée de questionnaire fournie, questionnaire conservé tel quel")
                
        except Questionnaire.DoesNotExist:
            # Créer un nouveau questionnaire pour les forums virtuels
            questionnaire = Questionnaire.objects.create(
                offer=offer,
                title=questionnaire_data.get('title', 'Questionnaire de candidature') if questionnaire_data else 'Questionnaire de candidature',
                description=questionnaire_data.get('description', '') if questionnaire_data else '',
                is_active=questionnaire_data.get('is_active', True) if questionnaire_data else True,
                is_required=questionnaire_data.get('is_required', True) if questionnaire_data else True
            )
            print(f"Nouveau questionnaire créé: {questionnaire.id}")
            
            # Créer les questions si fournies
            if questionnaire_data and 'questions' in questionnaire_data and questionnaire_data['questions'] and len(questionnaire_data['questions']) > 0:
                questions_data = questionnaire_data['questions']
                for i, question_data in enumerate(questions_data):
                    if question_data and isinstance(question_data, dict):
                        Question.objects.create(questionnaire=questionnaire, **question_data)
                        print(f"Question {i+1} créée")
                print(f"Questionnaire créé avec {questionnaire.questions.count()} questions")
            else:
                print("Questionnaire créé sans questions")
    else:
        print(f"Forum non virtuel: {offer.forum.name}, pas de questionnaire créé")
    
    return offer

def delete_offer_service(recruiter, offer_id):
    """
    Supprime une offre en vérifiant que le recruteur appartient à la même entreprise
    """
    try:
        offer = Offer.objects.get(id=offer_id)
        print(f"Offre trouvée: {offer.id}, Entreprise: {offer.company}")
        print(f"Recruiter: {recruiter}, Entreprise: {recruiter.company}")
        
        # Vérifier que le recruteur appartient à la même entreprise que l'offre
        if offer.company != recruiter.company:
            raise ValidationError("Vous ne pouvez supprimer que les offres de votre entreprise.")
        
        offer.delete()
        print(f"Offre {offer_id} supprimée avec succès")
        
    except Offer.DoesNotExist:
        print(f"Offre {offer_id} n'existe pas")
        raise ValidationError("Offre introuvable.")