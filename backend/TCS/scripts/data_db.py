import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from users.models import User
from forums.models import Forum, ForumRegistration
from company.models import Company, ForumCompany
from recruiters.models import Recruiter, RecruiterForumParticipation
from organizers.models import Organizer
from candidates.models import Candidate

# --- 🔄 Reset de la base de données (optionnel) ---
User.objects.all().delete()
Organizer.objects.all().delete()
Company.objects.all().delete()
Forum.objects.all().delete()
Recruiter.objects.all().delete()
ForumCompany.objects.all().delete()
ForumRegistration.objects.all().delete()

# --- 📌 Création de superuser ---
admin = User.objects.create_superuser(email='admin@example.com', password='adminpass')

# --- 📌 Création de 3 organisateurs ---
organizers = []
for i in range(1, 4):
    user = User.objects.create_user(email=f'organizer{i}@example.com', password='organizerpass', role='organizer')
    organizer = Organizer.objects.create(user=user, name=f"Organisateur {i}", phone_number=f"06010203{i}")
    organizers.append(organizer)

# --- 📌 Création de 20 entreprises ---
companies = []
for i in range(1, 21):
    company = Company.objects.create(name=f"Entreprise {i}", website=f"https://entreprise{i}.com")
    companies.append(company)

# --- 📌 Création de 5 forums ---
forums = []
types = ['presentiel', 'distance', 'hybride']
for i in range(1, 6):
    forum = Forum.objects.create(
        name=f"Forum {i}",
        type=random.choice(types),
        description=f"Description du Forum {i}",
        date=datetime.now() + timedelta(days=random.randint(10, 100)),
        organizer=random.choice(organizers)
    )
    forums.append(forum)

# --- 📌 Création de 30 recruteurs et association avec les forums ---
for i in range(1, 31):
    user = User.objects.create_user(email=f'recruiter{i}@example.com', password='recruiterpass', role='company')
    company = random.choice(companies)
    recruiter = Recruiter.objects.create(
        user=user,
        company=company,
        first_name=f"Prénom {i}",
        last_name=f"Nom {i}",
        phone_number=f"06060606{i}"
    )

    # Participation aléatoire à des forums
    random_forums = random.sample(forums, k=random.randint(1, 3))
    for forum in random_forums:
        RecruiterForumParticipation.objects.create(recruiter=recruiter, forum=forum)

# --- 📌 Liaison des entreprises aux forums ---
for company in companies:
    random_forums = random.sample(forums, k=random.randint(1, 2))
    for forum in random_forums:
        ForumCompany.objects.create(company=company, forum=forum)

print("📌 Base de données remplie avec succès :")
print(f"- 3 Organisateurs créés")
print(f"- 20 Entreprises créées")
print(f"- 5 Forums créés")
print(f"- 30 Recruteurs créés")
