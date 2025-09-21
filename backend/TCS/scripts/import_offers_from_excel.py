import os
import django
import pandas as pd
import random
from datetime import datetime, timedelta
from django.db import transaction

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from recruiters.models import Offer, Recruiter
from company.models import Company
from forums.models import Forum

def get_random_choices():
    """Génère des choix aléatoires pour les champs"""
    sectors = [
        'informatique', 'finance', 'marketing', 'ressources_humaines',
        'vente', 'production', 'logistique', 'communication', 'juridique',
        'comptabilite', 'ingenierie', 'sante', 'education', 'immobilier'
    ]
    
    contract_types = [
        'CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel', 'Temps plein'
    ]
    
    locations = [
        'Toulouse', 'Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Lille',
        'Nantes', 'Strasbourg', 'Montpellier', 'Rennes', 'Nice', 'Lille'
    ]
    
    experience_levels = ['0-1', '1-3', '3-5', '5+']
    
    return {
        'sector': random.choice(sectors),
        'contract_type': random.choice(contract_types),
        'location': random.choice(locations),
        'experience_required': random.choice(experience_levels)
    }

def get_random_start_date():
    """Génère une date de début aléatoire dans les 6 prochains mois"""
    today = datetime.now().date()
    future_date = today + timedelta(days=random.randint(30, 180))
    return future_date

def distribute_offers_to_companies(offers_data, offers_per_company=12):
    """
    Distribue les offres aux entreprises
    Chaque entreprise reçoit entre 10 et 15 offres
    """
    companies = list(Company.objects.all())
    if not companies:
        print("❌ Aucune entreprise trouvée dans la base de données")
        return
    
    print(f"📊 {len(companies)} entreprises trouvées")
    print(f"📋 {len(offers_data)} offres à distribuer")
    
    # Mélanger les offres
    random.shuffle(offers_data)
    
    # Distribuer les offres
    offers_per_company_list = []
    for i in range(len(companies)):
        # Entre 10 et 15 offres par entreprise
        num_offers = random.randint(10, 15)
        offers_per_company_list.append(num_offers)
    
    # Ajuster si le total dépasse le nombre d'offres disponibles
    total_planned = sum(offers_per_company_list)
    if total_planned > len(offers_data):
        # Réduire proportionnellement
        factor = len(offers_data) / total_planned
        offers_per_company_list = [max(1, int(num * factor)) for num in offers_per_company_list]
    
    print(f"📈 Distribution planifiée: {offers_per_company_list}")
    
    return companies, offers_per_company_list

def assign_offers_to_recruiters(company, offers_for_company, offers_data, start_index):
    """
    Assigne les offres aux recruteurs de l'entreprise
    """
    # Récupérer les recruteurs de cette entreprise
    recruiters = Recruiter.objects.filter(company=company)
    
    if not recruiters:
        print(f"⚠️  Aucun recruteur trouvé pour l'entreprise {company.name}")
        return start_index
    
    print(f"👥 {len(recruiters)} recruteurs trouvés pour {company.name}")
    
    # Récupérer les forums où cette entreprise participe
    from company.models import ForumCompany
    forums = list(Forum.objects.filter(forumcompany__company=company))
    if not forums:
        print(f"⚠️  L'entreprise {company.name} ne participe à aucun forum")
        return start_index
    
    # Distribuer les offres aux recruteurs
    offers_per_recruiter = offers_for_company // len(recruiters)
    remaining_offers = offers_for_company % len(recruiters)
    
    current_index = start_index
    
    for i, recruiter in enumerate(recruiters):
        # Calculer le nombre d'offres pour ce recruteur
        num_offers = offers_per_recruiter
        if i < remaining_offers:  # Distribuer les offres restantes
            num_offers += 1
        
        # Créer les offres pour ce recruteur
        for j in range(num_offers):
            if current_index >= len(offers_data):
                break
                
            offer_data = offers_data[current_index]
            random_data = get_random_choices()
            forum = random.choice(forums)
            
            try:
                with transaction.atomic():
                    offer = Offer.objects.create(
                        recruiter=recruiter,
                        company=company,
                        forum=forum,
                        title=offer_data['title'],
                        description=offer_data['description'],
                        profile_recherche=offer_data['profile_recherche'],
                        location=random_data['location'],
                        sector=random_data['sector'],
                        contract_type=random_data['contract_type'],
                        experience_required=random_data['experience_required'],
                        start_date=get_random_start_date(),
                        status='published'  # Toutes les offres sont publiées
                    )
                    print(f"✅ Offre créée: {offer.title} pour {recruiter.user.email} dans {company.name}")
                    
            except Exception as e:
                print(f"❌ Erreur lors de la création de l'offre: {e}")
            
            current_index += 1
    
    return current_index

def import_offers_from_excel():
    """
    Fonction principale pour importer les offres depuis Excel
    """
    excel_path = os.path.join(os.path.dirname(__file__), 'offers.xlsx')
    
    if not os.path.exists(excel_path):
        print(f"❌ Fichier Excel non trouvé: {excel_path}")
        return
    
    try:
        # Lire le fichier Excel
        print("📖 Lecture du fichier Excel...")
        df = pd.read_excel(excel_path)
        
        # Vérifier les colonnes nécessaires
        required_columns = ['title', 'description', 'profile_recherche']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"❌ Colonnes manquantes dans le fichier Excel: {missing_columns}")
            print(f"📋 Colonnes disponibles: {list(df.columns)}")
            return
        
        # Nettoyer les données
        df = df.dropna(subset=required_columns)
        df = df.fillna('')  # Remplacer les NaN par des chaînes vides
        
        # Convertir en liste de dictionnaires
        offers_data = df[required_columns].to_dict('records')
        
        print(f"📊 {len(offers_data)} offres trouvées dans le fichier Excel")
        
        # Distribuer les offres aux entreprises
        companies, offers_per_company_list = distribute_offers_to_companies(offers_data)
        
        # Créer les offres
        current_index = 0
        total_created = 0
        
        for i, company in enumerate(companies):
            if current_index >= len(offers_data):
                break
                
            offers_for_company = offers_per_company_list[i]
            print(f"\n🏢 Traitement de l'entreprise: {company.name} ({offers_for_company} offres)")
            
            current_index = assign_offers_to_recruiters(
                company, offers_for_company, offers_data, current_index
            )
            total_created += offers_for_company
        
        print(f"\n🎉 Import terminé!")
        print(f"📊 Total d'offres créées: {total_created}")
        print(f"🏢 Nombre d'entreprises traitées: {len(companies)}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("🚀 Début de l'import des offres depuis Excel...")
    import_offers_from_excel()
