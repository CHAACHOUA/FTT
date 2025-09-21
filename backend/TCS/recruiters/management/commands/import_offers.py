import os
import pandas as pd
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.conf import settings

from recruiters.models import Offer, Recruiter
from company.models import Company
from forums.models import Forum


class Command(BaseCommand):
    help = 'Importe les offres depuis un fichier Excel et les distribue aux entreprises et recruteurs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='scripts/offers.xlsx',
            help='Chemin vers le fichier Excel (défaut: scripts/offers.xlsx)'
        )
        parser.add_argument(
            '--min-offers',
            type=int,
            default=10,
            help='Nombre minimum d\'offres par entreprise (défaut: 10)'
        )
        parser.add_argument(
            '--max-offers',
            type=int,
            default=15,
            help='Nombre maximum d\'offres par entreprise (défaut: 15)'
        )
        parser.add_argument(
            '--status',
            type=str,
            default='published',
            choices=['draft', 'published', 'expired'],
            help='Statut des offres créées (défaut: published)'
        )

    def get_random_choices(self):
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

    def get_random_start_date(self):
        """Génère une date de début aléatoire dans les 6 prochains mois"""
        today = datetime.now().date()
        future_date = today + timedelta(days=random.randint(30, 180))
        return future_date

    def distribute_offers_to_companies(self, offers_data, min_offers, max_offers):
        """
        Distribue les offres aux entreprises
        Chaque entreprise reçoit entre min_offers et max_offers offres
        """
        companies = list(Company.objects.all())
        if not companies:
            raise CommandError("❌ Aucune entreprise trouvée dans la base de données")
        
        self.stdout.write(f"📊 {len(companies)} entreprises trouvées")
        self.stdout.write(f"📋 {len(offers_data)} offres à distribuer")
        
        # Mélanger les offres
        random.shuffle(offers_data)
        
        # Distribuer les offres
        offers_per_company_list = []
        for i in range(len(companies)):
            # Entre min_offers et max_offers offres par entreprise
            num_offers = random.randint(min_offers, max_offers)
            offers_per_company_list.append(num_offers)
        
        # Ajuster si le total dépasse le nombre d'offres disponibles
        total_planned = sum(offers_per_company_list)
        if total_planned > len(offers_data):
            # Réduire proportionnellement
            factor = len(offers_data) / total_planned
            offers_per_company_list = [max(1, int(num * factor)) for num in offers_per_company_list]
        
        self.stdout.write(f"📈 Distribution planifiée: {offers_per_company_list}")
        
        return companies, offers_per_company_list

    def assign_offers_to_recruiters(self, company, offers_for_company, offers_data, start_index, status):
        """
        Assigne les offres aux recruteurs de l'entreprise
        """
        # Récupérer les recruteurs de cette entreprise
        recruiters = Recruiter.objects.filter(company=company)
        
        if not recruiters:
            self.stdout.write(
                self.style.WARNING(f"⚠️  Aucun recruteur trouvé pour l'entreprise {company.name}")
            )
            return start_index
        
        self.stdout.write(f"👥 {len(recruiters)} recruteurs trouvés pour {company.name}")
        
        # Récupérer les forums disponibles
        forums = list(Forum.objects.all())
        if not forums:
            raise CommandError("❌ Aucun forum trouvé")
        
        # Distribuer les offres aux recruteurs
        offers_per_recruiter = offers_for_company // len(recruiters)
        remaining_offers = offers_for_company % len(recruiters)
        
        current_index = start_index
        created_count = 0
        
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
                random_data = self.get_random_choices()
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
                            start_date=self.get_random_start_date(),
                            status=status
                        )
                        created_count += 1
                        self.stdout.write(
                            f"✅ Offre créée: {offer.title} pour {recruiter.user.email} dans {company.name}"
                        )
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ Erreur lors de la création de l'offre: {e}")
                    )
                
                current_index += 1
        
        return current_index, created_count

    def handle(self, *args, **options):
        file_path = options['file']
        min_offers = options['min_offers']
        max_offers = options['max_offers']
        status = options['status']
        
        # Construire le chemin complet
        if not os.path.isabs(file_path):
            file_path = os.path.join(settings.BASE_DIR, file_path)
        
        if not os.path.exists(file_path):
            raise CommandError(f"❌ Fichier Excel non trouvé: {file_path}")
        
        try:
            # Lire le fichier Excel
            self.stdout.write("📖 Lecture du fichier Excel...")
            df = pd.read_excel(file_path)
            
            # Vérifier les colonnes nécessaires
            required_columns = ['title', 'description', 'profile_recherche']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise CommandError(
                    f"❌ Colonnes manquantes dans le fichier Excel: {missing_columns}\n"
                    f"📋 Colonnes disponibles: {list(df.columns)}"
                )
            
            # Nettoyer les données
            df = df.dropna(subset=required_columns)
            df = df.fillna('')  # Remplacer les NaN par des chaînes vides
            
            # Convertir en liste de dictionnaires
            offers_data = df[required_columns].to_dict('records')
            
            self.stdout.write(f"📊 {len(offers_data)} offres trouvées dans le fichier Excel")
            
            # Distribuer les offres aux entreprises
            companies, offers_per_company_list = self.distribute_offers_to_companies(
                offers_data, min_offers, max_offers
            )
            
            # Créer les offres
            current_index = 0
            total_created = 0
            
            for i, company in enumerate(companies):
                if current_index >= len(offers_data):
                    break
                    
                offers_for_company = offers_per_company_list[i]
                self.stdout.write(f"\n🏢 Traitement de l'entreprise: {company.name} ({offers_for_company} offres)")
                
                current_index, created_count = self.assign_offers_to_recruiters(
                    company, offers_for_company, offers_data, current_index, status
                )
                total_created += created_count
            
            self.stdout.write(
                self.style.SUCCESS(f"\n🎉 Import terminé!")
            )
            self.stdout.write(f"📊 Total d'offres créées: {total_created}")
            self.stdout.write(f"🏢 Nombre d'entreprises traitées: {len(companies)}")
            self.stdout.write(f"📝 Statut des offres: {status}")
            
        except Exception as e:
            raise CommandError(f"❌ Erreur lors de l'import: {e}")
