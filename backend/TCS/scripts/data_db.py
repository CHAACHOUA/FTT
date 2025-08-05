import os
import django
import random
from datetime import datetime, timedelta, time
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from users.models import User
from forums.models import Forum, ForumRegistration
from company.models import Company, ForumCompany
from recruiters.models import Recruiter, RecruiterForumParticipation
from organizers.models import Organizer
from candidates.models import Candidate

def create_forums_data():
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
    forum_types = ['presentiel', 'virtuel', 'hybride']
    
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
    
    for i, name in enumerate(company_names):
        company = Company.objects.create(
            name=name,
            website=f"https://{name.lower().replace(' ', '').replace('.', '').replace(',', '')}.com",
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

if __name__ == "__main__":
    create_forums_data() 