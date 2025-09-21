import os
import sys
import django
import random
import shutil
from datetime import datetime, timedelta

from django.core.files.uploadedfile import SimpleUploadedFile

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from django.contrib.auth import get_user_model
from candidates.models import Candidate, Experience, Education, Skill, Language, CandidateLanguage
from forums.models import Forum, ForumRegistration, CandidateSearch
from users.models import User
from TCS.constants import REGION_CHOICES, CONTRACT_CHOICES, SECTOR_CHOICES

User = get_user_model()

def update_existing_candidates():
    """Met à jour les candidats existants avec des photos et inscriptions aux forums"""
    
    print("🔄 Mise à jour des candidats existants...")
    
    # Récupérer tous les candidats existants
    candidates = Candidate.objects.all()
    if not candidates.exists():
        print("❌ Aucun candidat trouvé dans la base de données.")
        return
    
    print(f"👥 {candidates.count()} candidats trouvés dans la base de données")
    
    # Récupérer tous les forums disponibles
    forums = Forum.objects.all()
    if not forums.exists():
        print("❌ Aucun forum trouvé. Veuillez créer des forums avant de mettre à jour les candidats.")
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
    
    # Données réalistes pour les filtres - utiliser les constantes
    REGIONS = [choice[0] for choice in REGION_CHOICES]  # Utiliser les villes des constantes
    CONTRACT_TYPES = [choice[0] for choice in CONTRACT_CHOICES]
    EXPERIENCE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]
    
    updated_count = 0
    
    for candidate in candidates:
        try:
            print(f"🔄 Traitement du candidat : {candidate.first_name} {candidate.last_name}")
            
            # Ajouter une photo de profil si le candidat n'en a pas et qu'il y a des photos disponibles
            if not candidate.profile_picture and available_pictures:
                picture_path = random.choice(available_pictures)
                # Lire le contenu du fichier et créer un SimpleUploadedFile
                with open(picture_path, 'rb') as f:
                    file_content = f.read()
                file_name = os.path.basename(picture_path)
                candidate.profile_picture = SimpleUploadedFile(file_name, file_content, content_type='image/jpeg')
                candidate.save()
                print(f"  📸 Photo ajoutée : {file_name}")
            
            # Générer des données aléatoires pour les filtres
            region = random.choice(REGIONS)
            contract_type = random.choice(CONTRACT_TYPES)
            experience_years = random.choice(EXPERIENCE_LEVELS)
            rqth = random.choice([True, False, False, False, False])  # 20% de chance d'être RQTH
            
            # Vérifier si le candidat est déjà inscrit à des forums
            existing_registrations = ForumRegistration.objects.filter(candidate=candidate)
            
            if existing_registrations.exists():
                print(f"  ℹ️ Candidat déjà inscrit à {existing_registrations.count()} forum(s)")
                # Mettre à jour les données de recherche existantes
                for registration in existing_registrations:
                    if registration.search:
                        registration.search.region = region
                        registration.search.rqth = rqth
                        registration.search.experience = experience_years
                        registration.search.contract_type = [contract_type]
                        registration.search.sector = [random.choice([choice[0] for choice in SECTOR_CHOICES])]
                        registration.search.save()
                        print(f"  🔄 Données de recherche mises à jour pour {registration.forum.name}")
            else:
                # Inscrire le candidat à 1-2 forums aléatoires
                num_forums = random.randint(1, min(2, forums.count()))
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
                            'sector': [random.choice([choice[0] for choice in SECTOR_CHOICES])],
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
            
            updated_count += 1
            print(f"✅ Candidat mis à jour : {candidate.first_name} {candidate.last_name} - {contract_type} - {experience_years} ans - {region}")
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du candidat {candidate.first_name} {candidate.last_name}: {e}")
            continue
    
    print(f"\n🎉 Mise à jour terminée ! {updated_count} candidats mis à jour avec succès.")
    print("📸 Photos : Ajoutées aux candidats qui n'en avaient pas")
    print("📋 Inscriptions aux forums : Chaque candidat inscrit à 1-2 forums")
    print("🔍 Profils de recherche : Créés/mis à jour avec des données cohérentes")
    print("🎯 Données de test : Régions, contrats, expérience, RQTH variés pour les filtres")

def run():
    """Fonction requise pour django-extensions"""
    update_existing_candidates()