import os
import sys
import django
import random
import shutil
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from django.contrib.auth import get_user_model
from candidates.models import Candidate, Experience, Education, Skill, Language, CandidateLanguage
from forums.models import Forum, ForumRegistration, CandidateSearch
from users.models import User

User = get_user_model()

# Données réalistes pour différents domaines
REAL_COMPANIES = {
    'informatique': [
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Spotify', 'Slack',
        'Salesforce', 'Adobe', 'Oracle', 'IBM', 'Intel', 'Cisco', 'VMware', 'SAP', 'Dell', 'HP',
        'Atos', 'Capgemini', 'Sopra Steria', 'Orange', 'Bouygues', 'Thales', 'Dassault Systèmes'
    ],
    'finance': [
        'BNP Paribas', 'Crédit Agricole', 'Société Générale', 'LCL', 'Caisse d\'Épargne', 'Banque Populaire',
        'Crédit Mutuel', 'AXA', 'Allianz', 'Generali', 'CNP Assurances', 'Maif', 'Macif',
        'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Deutsche Bank', 'UBS', 'Credit Suisse'
    ],
    'consulting': [
        'McKinsey & Company', 'Bain & Company', 'Boston Consulting Group', 'Deloitte', 'PwC', 'EY', 'KPMG',
        'Accenture', 'Capgemini Consulting', 'Roland Berger', 'Oliver Wyman', 'Strategy&'
    ],
    'industrie': [
        'Total', 'EDF', 'Engie', 'Veolia', 'Saint-Gobain', 'Schneider Electric', 'Legrand', 'Valeo',
        'Faurecia', 'Michelin', 'Renault', 'PSA', 'Airbus', 'Safran', 'Thales', 'Alstom'
    ],
    'sante': [
        'Sanofi', 'Novartis', 'Roche', 'Pfizer', 'AstraZeneca', 'GSK', 'Merck', 'Bayer',
        'AP-HP', 'CHU', 'Fondation Rothschild', 'Institut Curie', 'Institut Pasteur'
    ],
    'marketing': [
        'Publicis', 'Havas', 'WPP', 'Omnicom', 'Interpublic', 'Dentsu', 'TBWA', 'Ogilvy',
        'McCann', 'Leo Burnett', 'Saatchi & Saatchi', 'BBDO', 'DDB'
    ],
    'luxe': [
        'LVMH', 'Kering', 'Richemont', 'Hermès', 'Chanel', 'Dior', 'Cartier', 'Rolex',
        'Patek Philippe', 'Audemars Piguet', 'Breguet', 'Boucheron'
    ]
}

REAL_JOBS = {
    'informatique': [
        'Développeur Full Stack', 'Ingénieur DevOps', 'Data Scientist', 'Product Manager', 'Scrum Master',
        'Architecte Logiciel', 'Développeur Frontend', 'Développeur Backend', 'Ingénieur Cloud',
        'DevOps Engineer', 'Software Engineer', 'Tech Lead', 'CTO', 'Chef de Projet IT'
    ],
    'finance': [
        'Analyste Financier', 'Gestionnaire de Portefeuille', 'Trader', 'Risk Manager', 'Comptable',
        'Auditeur', 'Contrôleur de Gestion', 'Directeur Financier', 'Analyste Crédit',
        'Gestionnaire de Patrimoine', 'Conseiller en Investissement'
    ],
    'consulting': [
        'Consultant Senior', 'Manager', 'Directeur', 'Associé', 'Analyste Consultant',
        'Chef de Projet', 'Expert Sectoriel', 'Stratège', 'Transformation Manager'
    ],
    'industrie': [
        'Ingénieur Production', 'Chef de Projet Industriel', 'Responsable Qualité', 'Ingénieur R&D',
        'Directeur Technique', 'Ingénieur Maintenance', 'Responsable Supply Chain', 'Ingénieur Process'
    ],
    'sante': [
        'Médecin', 'Pharmacien', 'Chercheur', 'Ingénieur Biomédical', 'Responsable R&D',
        'Chef de Projet Médical', 'Data Scientist Santé', 'Biostatisticien'
    ],
    'marketing': [
        'Chef de Produit Marketing', 'Digital Marketing Manager', 'Brand Manager', 'Marketing Manager',
        'Growth Hacker', 'Content Manager', 'SEO Specialist', 'Social Media Manager'
    ],
    'luxe': [
        'Brand Manager', 'Product Manager', 'Retail Manager', 'Merchandising Manager',
        'Digital Marketing Manager', 'CRM Manager', 'Store Manager', 'Visual Merchandiser'
    ]
}

REAL_EDUCATION = {
    'informatique': [
        ('Master en Informatique', 'École Centrale Paris'),
        ('Master en Data Science', 'ENSAE Paris'),
        ('Master en Intelligence Artificielle', 'Sorbonne Université'),
        ('Master en Systèmes d\'Information', 'HEC Paris'),
        ('Master en Génie Logiciel', 'Télécom Paris'),
        ('Master en Cybersécurité', 'ESIEE Paris'),
        ('Master en Cloud Computing', 'EPITA'),
        ('Master en DevOps', 'Epitech')
    ],
    'finance': [
        ('Master en Finance', 'HEC Paris'),
        ('Master en Économie', 'Sciences Po Paris'),
        ('Master en Gestion', 'ESSEC'),
        ('Master en Finance Quantitative', 'ENSAE Paris'),
        ('Master en Audit', 'ESCP Europe'),
        ('Master en Risk Management', 'EDHEC')
    ],
    'consulting': [
        ('Master en Management', 'HEC Paris'),
        ('Master en Stratégie', 'Sciences Po Paris'),
        ('Master en Consulting', 'ESSEC'),
        ('Master en Business Administration', 'INSEAD'),
        ('Master en Économie', 'Sorbonne Université')
    ],
    'industrie': [
        ('Master en Génie Industriel', 'École Centrale Paris'),
        ('Master en Génie Mécanique', 'Arts et Métiers'),
        ('Master en Génie Électrique', 'Supélec'),
        ('Master en Automatique', 'Télécom Paris'),
        ('Master en Génie Chimique', 'ENSCP')
    ],
    'sante': [
        ('Doctorat en Médecine', 'Université Paris Descartes'),
        ('Master en Pharmacie', 'Université Paris-Saclay'),
        ('Master en Biologie', 'Sorbonne Université'),
        ('Master en Biostatistiques', 'ENSAE Paris'),
        ('Master en Épidémiologie', 'Institut Pasteur')
    ],
    'marketing': [
        ('Master en Marketing', 'HEC Paris'),
        ('Master en Communication', 'Sciences Po Paris'),
        ('Master en Digital Marketing', 'ESCP Europe'),
        ('Master en Brand Management', 'ESSEC'),
        ('Master en Publicité', 'Celsa')
    ],
    'luxe': [
        ('Master en Management du Luxe', 'ESSEC'),
        ('Master en Marketing du Luxe', 'ESCP Europe'),
        ('Master en Mode et Luxe', 'IFM'),
        ('Master en Brand Management', 'HEC Paris'),
        ('Master en Retail Management', 'ESCP Europe')
    ]
}

REAL_SKILLS = {
    'informatique': [
        'Python', 'JavaScript', 'Java', 'React', 'Node.js', 'Docker', 'Kubernetes', 'AWS', 'Azure',
        'Git', 'SQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka', 'Microservices', 'REST API',
        'GraphQL', 'TypeScript', 'Vue.js', 'Angular', 'Spring Boot', 'Django', 'Flask'
    ],
    'finance': [
        'Excel', 'VBA', 'Python', 'R', 'SAS', 'Bloomberg', 'Reuters', 'RiskMetrics', 'VaR',
        'Monte Carlo', 'Black-Scholes', 'Financial Modeling', 'Accounting', 'Audit', 'Compliance'
    ],
    'consulting': [
        'PowerPoint', 'Excel', 'Strategy', 'Business Development', 'Change Management',
        'Process Optimization', 'Market Analysis', 'Competitive Intelligence', 'Project Management'
    ],
    'industrie': [
        'AutoCAD', 'SolidWorks', 'CATIA', 'SAP', 'Six Sigma', 'Lean Manufacturing', 'Quality Management',
        'Supply Chain Management', 'Maintenance Planning', 'Process Optimization'
    ],
    'sante': [
        'R', 'Python', 'SAS', 'SPSS', 'Clinical Trials', 'Biostatistics', 'Epidemiology',
        'Medical Research', 'Data Analysis', 'Statistical Modeling'
    ],
    'marketing': [
        'Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO', 'SEM', 'Content Marketing',
        'Social Media Marketing', 'Email Marketing', 'CRM', 'Marketing Automation'
    ],
    'luxe': [
        'Brand Management', 'Retail Management', 'CRM', 'Visual Merchandising', 'Customer Experience',
        'Luxury Marketing', 'Digital Marketing', 'Social Media', 'E-commerce'
    ]
}

# Prénoms et noms français réalistes
FIRST_NAMES = [
    'Thomas', 'Lucas', 'Hugo', 'Jules', 'Léo', 'Gabriel', 'Raphaël', 'Arthur', 'Louis', 'Adam',
    'Emma', 'Léa', 'Chloé', 'Jade', 'Alice', 'Lola', 'Inès', 'Camille', 'Sarah', 'Zoé',
    'Antoine', 'Nicolas', 'Pierre', 'Alexandre', 'Baptiste', 'Maxime', 'Théo', 'Paul', 'Victor', 'Romain',
    'Marie', 'Sophie', 'Julie', 'Clara', 'Manon', 'Eva', 'Louise', 'Mia', 'Nina', 'Léna'
]

LAST_NAMES = [
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
    'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
    'Morel', 'Girard', 'Andre', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Francois', 'Martinez'
]

def clean_existing_candidates():
    """Supprime tous les candidats existants et leurs utilisateurs associés"""
    print("🧹 Nettoyage des candidats existants...")
    
    # Supprimer tous les utilisateurs avec le rôle 'candidate'
    candidate_users = User.objects.filter(role='candidate')
    users_deleted = candidate_users.count()
    candidate_users.delete()
    
    # Supprimer tous les candidats (au cas où il en resterait)
    candidates = Candidate.objects.all()
    candidates_deleted = candidates.count()
    candidates.delete()
    
    print(f"✅ {candidates_deleted} candidats et {users_deleted} utilisateurs supprimés")
    print("🧹 Nettoyage terminé !")

def generate_realistic_candidates(num_candidates=50, clean_existing=True):
    """Génère des candidats réalistes avec de vraies entreprises et expériences"""
    
    # Nettoyer d'abord les candidats existants si demandé
    if clean_existing:
        clean_existing_candidates()
    
    print(f"Génération de {num_candidates} candidats réalistes...")
    
    # Récupérer tous les forums disponibles
    forums = Forum.objects.all()
    if not forums.exists():
        print("❌ Aucun forum trouvé. Veuillez créer des forums avant de générer des candidats.")
        return
    
    print(f"📋 {forums.count()} forums trouvés pour l'inscription des candidats")
    
    # Récupérer les photos disponibles depuis scripts/candidate_pictures
    pictures_dir = os.path.join(os.path.dirname(__file__), 'candidate_pictures')
    available_pictures = []
    if os.path.exists(pictures_dir):
        for file in os.listdir(pictures_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                available_pictures.append(os.path.join(pictures_dir, file))
    
    print(f"📸 {len(available_pictures)} photos trouvées pour les candidats")
    
    # Données réalistes pour les filtres
    REGIONS = ['Occitanie', 'Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine', 'Hauts-de-France', 'Grand Est', 'Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Normandie']
    CONTRACT_TYPES = ['CDI', 'CDD', 'Alternance', 'Freelance', 'Stage']
    EXPERIENCE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]
    
    for i in range(num_candidates):
        # Choisir un domaine aléatoire
        domain = random.choice(list(REAL_COMPANIES.keys()))
        
        # Générer des données personnelles
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        title = random.choice(['Monsieur', 'Madame'])
        
        # Email séquentiel
        email = f"candidat{i+1}@gmail.com"
        
        # Téléphone ironisé
        phone = f"0{random.randint(6, 7)}{random.randint(10000000, 99999999)}"
        
        # Données réalistes pour les filtres
        region = random.choice(REGIONS)
        contract_type = random.choice(CONTRACT_TYPES)
        experience_years = random.choice(EXPERIENCE_LEVELS)
        rqth = random.choice([True, False, False, False, False])  # 20% de chance d'être RQTH
        
        # Vérifier si l'email existe déjà
        if User.objects.filter(email=email).exists():
            print(f"⚠️ L'email {email} existe déjà, passage au suivant...")
            continue
            
        # Créer l'utilisateur
        try:
            user = User.objects.create_user(
                email=email,
                password='password123',
                role='candidate',
                is_active=True
            )
            
            # Créer le profil candidat
            candidate_data = {
                'user': user,
                'first_name': first_name,
                'last_name': last_name,
                'title': title,
                'phone': phone,
                'education_level': random.choice(['Bac+3', 'Bac+4', 'Bac+5', 'Bac+8']),
                'preferred_contract_type': contract_type
            }
            
            # Ajouter une photo de profil si disponible
            if available_pictures:
                picture_path = random.choice(available_pictures)
                # Lire le contenu du fichier et créer un SimpleUploadedFile
                with open(picture_path, 'rb') as f:
                    file_content = f.read()
                file_name = os.path.basename(picture_path)
                candidate_data['profile_picture'] = SimpleUploadedFile(file_name, file_content, content_type='image/jpeg')
            
            candidate = Candidate.objects.create(**candidate_data)
            
            # Ajouter 1-3 expériences
            num_experiences = random.randint(1, 3)
            for exp_idx in range(num_experiences):
                company = random.choice(REAL_COMPANIES[domain])
                job_title = random.choice(REAL_JOBS[domain])
                
                # Dates réalistes
                start_date = datetime.now() - timedelta(days=random.randint(365, 1825))  # 1-5 ans
                end_date = start_date + timedelta(days=random.randint(180, 1095))  # 6 mois - 3 ans
                
                Experience.objects.create(
                    candidate=candidate,
                    job_title=job_title,
                    company=company,
                    description=f"Responsable de {job_title.lower()} chez {company}. Missions principales : développement de projets, gestion d'équipe, optimisation des processus.",
                    start_date=start_date.date(),
                    end_date=end_date.date()
                )
            
            # Ajouter 1-2 formations
            num_educations = random.randint(1, 2)
            for edu_idx in range(num_educations):
                degree, institution = random.choice(REAL_EDUCATION[domain])
                
                # Dates de formation
                start_date = datetime.now() - timedelta(days=random.randint(1095, 2555))  # 3-7 ans
                end_date = start_date + timedelta(days=random.randint(730, 1095))  # 2-3 ans
                
                Education.objects.create(
                    candidate=candidate,
                    degree=degree,
                    institution=institution,
                    start_date=start_date.date(),
                    end_date=end_date.date()
                )
            
            # Ajouter 5-10 compétences
            skills = random.sample(REAL_SKILLS[domain], random.randint(5, min(10, len(REAL_SKILLS[domain]))))
            for skill_name in skills:
                Skill.objects.create(
                    candidate=candidate,
                    name=skill_name
                )
            
            # Ajouter 2-3 langues
            languages = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Chinois']
            candidate_languages = random.sample(languages, random.randint(2, 3))
            
            for lang_name in candidate_languages:
                language, created = Language.objects.get_or_create(name=lang_name)
                level = random.choice(['Débutant', 'Intermédiaire', 'Avancé', 'Courant'])
                CandidateLanguage.objects.create(
                    candidate=candidate,
                    language=language,
                    level=level
                )
            
            # Inscrire le candidat à 1-3 forums aléatoires
            num_forums = random.randint(1, min(3, forums.count()))
            selected_forums = random.sample(list(forums), num_forums)
            
            for forum in selected_forums:
                try:
                    # Créer l'inscription au forum
                    registration = ForumRegistration.objects.create(
                        forum=forum,
                        candidate=candidate
                    )
                    
                    # Créer le profil de recherche pour ce forum avec des données cohérentes
                    search_data = {
                        'contract_type': [contract_type],
                        'sector': [domain],  # Utiliser le domaine du candidat
                        'experience': experience_years,
                        'region': region,
                        'rqth': rqth
                    }
                    
                    search = CandidateSearch.objects.create(**search_data)
                    
                    # Lier la recherche à l'inscription
                    registration.search = search
                    registration.save()
                    
                    print(f"  📋 Inscrit au forum : {forum.name}")
                    
                except Exception as e:
                    print(f"  ⚠️ Erreur lors de l'inscription au forum {forum.name}: {e}")
                    continue
            
            print(f"✅ Candidat {i+1}/{num_candidates} créé : {first_name} {last_name} ({domain}) - {contract_type} - {experience_years} ans - {region}")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du candidat {i+1}: {e}")
            continue
    
    print(f"\n🎉 Génération terminée ! {num_candidates} candidats créés avec succès.")
    print("📧 Emails séquentiels : candidat1@gmail.com à candidat50@gmail.com")
    print("🔑 Mot de passe : password123 (hashé automatiquement)")
    print("✅ Tous les comptes sont activés")
    print("🏢 Entreprises, expériences et formations sont basées sur des données réelles.")
    print("📸 Photos de profil : Assignées aléatoirement depuis le dossier scripts/candidate_pictures")
    print("📋 Inscriptions aux forums : Chaque candidat est inscrit à 1-3 forums")
    print("🔍 Profils de recherche : Créés avec des données cohérentes pour tester les filtres")
    print("🎯 Données de test : Régions, contrats, expérience, RQTH variés pour les filtres")

def run():
    """Fonction requise pour django-extensions"""
    generate_realistic_candidates(50) 