import random
from datetime import datetime, timedelta, time

from users.models import User
from forums.models import Forum, ForumRegistration
from company.models import Company, ForumCompany
from recruiters.models import Recruiter, RecruiterForumParticipation
from organizers.models import Organizer
from candidates.models import Candidate

def run():
    print("🚀 Début de la création des données...")
    
    # --- 🔄 Reset de la base de données ---
    print("🗑️ Nettoyage de la base de données...")
    User.objects.all().delete()
    Organizer.objects.all().delete()
    Company.objects.all().delete()
    Forum.objects.all().delete()
    Recruiter.objects.all().delete()
    ForumCompany.objects.all().delete()
    ForumRegistration.objects.all().delete()
    
    # --- 📌 Création du compte organisateur principal ---
    print("👤 Création du compte organisateur principal...")
    organizer_user = User.objects.create_user(
        email='organizer@gmail.com', 
        password='Digitalio123456', 
        role='organizer',
        is_active=True
    )
    organizer = Organizer.objects.create(
        user=organizer_user, 
        name="Organisateur Principal", 
        phone_number="0601020304"
    )
    
    # --- 📌 Création de 2 autres organisateurs ---
    print("👥 Création des autres organisateurs...")
    organizers = [organizer]
    for i in range(2, 4):
        user = User.objects.create_user(
            email=f'organizer{i}@example.com', 
            password='Digitalio123456', 
            role='organizer',
            is_active=True
        )
        organizer_obj = Organizer.objects.create(
            user=user, 
            name=f"Organisateur {i}", 
            phone_number=f"06010203{i}"
        )
        organizers.append(organizer_obj)
    
    # --- 📌 Création de 3 forums ---
    print("🏢 Création des 3 forums...")
    forums = []
    forum_names = ["Forum Digital Innovation", "Forum Tech Careers", "Forum Startup Connect"]
    forum_types = ['physique', 'virtuel', 'hybride']
    
    for i in range(3):
        # Date de début aléatoire entre 30 et 90 jours à partir d'aujourd'hui
        start_date = datetime.now().date() + timedelta(days=random.randint(30, 90))
        # Date de fin = date de début + 1 à 3 jours
        end_date = start_date + timedelta(days=random.randint(1, 3))
        
        # Heure de début aléatoire entre 8h et 10h
        start_hour = random.randint(8, 10)
        start_minute = random.choice([0, 30])
        start_time = time(hour=start_hour, minute=start_minute)
        
        # Heure de fin entre 16h et 18h
        end_hour = random.randint(16, 18)
        end_minute = random.choice([0, 30])
        end_time = time(hour=end_hour, minute=end_minute)
        
        forum = Forum.objects.create(
            name=forum_names[i],
            type=forum_types[i],
            description=f"Description du {forum_names[i]} - Un événement exceptionnel pour connecter talents et entreprises",
            start_date=start_date,
            end_date=end_date,
            start_time=start_time,
            end_time=end_time,
            organizer=organizers[i]
        )
        forums.append(forum)
    
    # --- 📌 Création de 20 entreprises par forum (60 entreprises total) ---
    print("🏭 Création des entreprises...")
    companies = []
    company_names = [
        "TechCorp Solutions", "Digital Dynamics", "Innovation Labs", "Future Systems", "Smart Solutions",
        "DataFlow Inc", "CloudTech", "AI Innovations", "WebWorks", "MobileFirst",
        "CyberSec Pro", "DevOps Masters", "UX Studio", "CodeCraft", "Pixel Perfect",
        "StartupHub", "GrowthTech", "ScaleUp", "VentureLab", "InnovationHub",
        "TechStart", "DigitalBridge", "FutureTech", "SmartBridge", "InnovationCorp",
        "DataTech", "CloudBridge", "AI Solutions", "WebTech", "MobileCorp",
        "CyberTech", "DevCorp", "UX Tech", "CodeLab", "PixelCorp",
        "StartupTech", "GrowthLab", "ScaleCorp", "VentureTech", "InnovationLab",
        "TechBridge", "DigitalLab", "FutureCorp", "SmartTech", "InnovationBridge",
        "DataCorp", "CloudLab", "AI Bridge", "WebCorp", "MobileLab",
        "CyberLab", "DevTech", "UX Corp", "CodeBridge", "PixelLab",
        "StartupCorp", "GrowthTech", "ScaleLab", "VentureCorp", "InnovationTech"
    ]
    
    # Descriptions d'entreprises
    company_descriptions = [
        "Leader dans le développement de solutions technologiques innovantes pour les entreprises modernes.",
        "Spécialiste en transformation digitale et optimisation des processus métier.",
        "Expert en intelligence artificielle et machine learning pour l'industrie 4.0.",
        "Pionnier dans les solutions cloud et l'infrastructure as-a-service.",
        "Innovateur en cybersécurité et protection des données sensibles.",
        "Expert en développement mobile et applications cross-platform.",
        "Spécialiste en UX/UI design et expérience utilisateur optimale.",
        "Leader en développement web et solutions e-commerce.",
        "Expert en data science et analyse prédictive.",
        "Innovateur en IoT et objets connectés intelligents.",
        "Spécialiste en DevOps et automatisation des déploiements.",
        "Expert en blockchain et technologies décentralisées.",
        "Leader en réalité virtuelle et augmentée.",
        "Spécialiste en marketing digital et growth hacking.",
        "Expert en gestion de projet agile et méthodologies modernes.",
        "Innovateur en fintech et solutions bancaires digitales.",
        "Spécialiste en edtech et plateformes d'apprentissage.",
        "Expert en healthtech et solutions médicales innovantes.",
        "Leader en greentech et technologies durables.",
        "Spécialiste en proptech et immobilier digital.",
        "Expert en retailtech et commerce connecté.",
        "Innovateur en mobility et transport intelligent.",
        "Spécialiste en insuretech et assurance digitale.",
        "Expert en legaltech et solutions juridiques automatisées.",
        "Leader en regtech et conformité réglementaire.",
        "Spécialiste en adtech et publicité programmatique.",
        "Expert en martech et automation marketing.",
        "Innovateur en hrtech et solutions RH digitales.",
        "Spécialiste en supply chain et logistique intelligente.",
        "Expert en manufacturing et industrie 4.0.",
        "Leader en energytech et solutions énergétiques.",
        "Spécialiste en agritech et agriculture connectée.",
        "Expert en cleantech et technologies propres.",
        "Innovateur en biotech et solutions biologiques.",
        "Spécialiste en nanotech et nanotechnologies.",
        "Expert en quantum computing et informatique quantique.",
        "Leader en space tech et technologies spatiales.",
        "Spécialiste en defense tech et cybersécurité militaire.",
        "Expert en gaming et développement de jeux vidéo.",
        "Innovateur en streaming et plateformes de contenu.",
        "Spécialiste en social media et réseaux sociaux.",
        "Expert en content creation et production multimédia.",
        "Leader en influencer marketing et partenariats digitaux.",
        "Spécialiste en SEO et optimisation pour les moteurs de recherche.",
        "Expert en PPC et publicité payante.",
        "Innovateur en email marketing et automation.",
        "Spécialiste en affiliate marketing et programmes partenaires.",
        "Expert en conversion optimization et CRO.",
        "Leader en customer experience et satisfaction client.",
        "Spécialiste en customer success et rétention client.",
        "Expert en sales automation et CRM.",
        "Innovateur en lead generation et prospection B2B.",
        "Spécialiste en account-based marketing et ABM.",
        "Expert en demand generation et génération de demande.",
        "Leader en revenue operations et RevOps.",
        "Spécialiste en sales enablement et formation commerciale.",
        "Expert en sales intelligence et données commerciales.",
        "Innovateur en sales engagement et engagement commercial.",
        "Spécialiste en sales performance et optimisation commerciale.",
        "Expert en sales analytics et analytics commerciales.",
        "Leader en sales coaching et coaching commercial.",
        "Spécialiste en sales training et formation vente.",
        "Expert en sales consulting et conseil commercial.",
        "Innovateur en sales technology et technologie commerciale."
    ]
    
    for i, name in enumerate(company_names):
        company = Company.objects.create(
            name=name,
            website=f"https://{name.lower().replace(' ', '').replace('.', '').replace(',', '')}.com",
            description=company_descriptions[i % len(company_descriptions)],
            sectors=random.sample(['IT', 'Marketing', 'Commerce', 'RH', 'Finance', 'Santé', 'Éducation', 'BTP', 'Logistique', 'Technologie'], k=random.randint(1, 3))
        )
        companies.append(company)
    
    # --- 📌 Association des entreprises aux forums (20 par forum) ---
    print("🔗 Association des entreprises aux forums...")
    companies_per_forum = 20
    for i, forum in enumerate(forums):
        start_idx = i * companies_per_forum
        end_idx = start_idx + companies_per_forum
        forum_companies = companies[start_idx:end_idx]
        
        for company in forum_companies:
            ForumCompany.objects.create(
                company=company,
                forum=forum,
                approved=True,
                stand=f"A{i+1:02d}" if i < 10 else f"B{i-9:02d}"
            )
    
    # --- 📌 Création des recruteurs (3-5 par entreprise) ---
    print("👨‍💼 Création des recruteurs...")
    recruiter_count = 0
    first_names = ["Jean", "Marie", "Pierre", "Sophie", "Paul", "Julie", "Thomas", "Camille", "Nicolas", "Emma",
                   "Alexandre", "Léa", "Antoine", "Chloé", "Maxime", "Sarah", "Vincent", "Manon", "Raphaël", "Clara",
                   "Guillaume", "Alice", "Hugo", "Eva", "Lucas", "Inès", "Louis", "Jade", "Jules", "Louise",
                   "Arthur", "Zoé", "Adam", "Lola", "Nathan", "Agathe", "Ethan", "Mia", "Noah", "Nina"]
    
    last_names = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
                  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
                  "Morel", "Girard", "Andre", "Lefevre", "Mercier", "Dupont", "Lambert", "Bonnet", "Francois", "Martinez",
                  "Legrand", "Garnier", "Faure", "Rousseau", "Blanc", "Henry", "Gautier", "Riviere", "Lucas", "Joly"]
    
    titles = ['Madame', 'Monsieur', 'Autre']
    
    for company in companies:
        num_recruiters = random.randint(3, 5)
        for j in range(num_recruiters):
            recruiter_count += 1
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            title = random.choice(titles)
            
            user = User.objects.create_user(
                email=f'recruiter{recruiter_count}@example.com',
                password='Digitalio123456',
                role='company',
                is_active=True
            )
            
            recruiter = Recruiter.objects.create(
                user=user,
                company=company,
                first_name=first_name,
                last_name=last_name,
                phone=f"06{random.randint(10000000, 99999999)}",
                title=title
            )
            
            # Association du recruteur au forum de son entreprise
            forum_participation = ForumCompany.objects.filter(company=company).first()
            if forum_participation:
                RecruiterForumParticipation.objects.create(
                    recruiter=recruiter,
                    forum=forum_participation.forum
                )
    
    print("\n✅ Données créées avec succès !")
    print(f"📊 Résumé :")
    print(f"   - 3 Organisateurs créés")
    print(f"   - 3 Forums créés")
    print(f"   - 60 Entreprises créées (20 par forum)")
    print(f"   - {recruiter_count} Recruteurs créés (3-5 par entreprise)")
    print(f"   - Compte organisateur principal : organizer@gmail.com / Digitalio123456")
    print(f"   - Tous les mots de passe sont hashés automatiquement par Django") 