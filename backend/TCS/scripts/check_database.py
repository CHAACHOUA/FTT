#!/usr/bin/env python
"""
Script pour vérifier la base de données
Total entreprises, offres par forum, entreprises par forum
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from django.db.models import Count
from company.models import Company
from recruiters.models import Offer
from forums.models import Forum

def check_database():
    print("=" * 60)
    print("VÉRIFICATION DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    # 1. Nombre total d'entreprises
    total_companies = Company.objects.count()
    print(f"📊 Total entreprises: {total_companies}")
    
    # 2. Nombre total d'offres
    total_offers = Offer.objects.count()
    print(f"📊 Total offres: {total_offers}")
    
    # 3. Nombre total de forums
    total_forums = Forum.objects.count()
    print(f"📊 Total forums: {total_forums}")
    
    print("\n" + "=" * 60)
    print("RÉPARTITION DES OFFRES PAR FORUM")
    print("=" * 60)
    
    # 4. Répartition des offres par forum
    forums_with_offers = Forum.objects.annotate(
        offer_count=Count('offers')
    ).order_by('id')
    
    for forum in forums_with_offers:
        print(f"🏢 Forum {forum.id} ({forum.name}): {forum.offer_count} offres")
    
    print("\n" + "=" * 60)
    print("RÉPARTITION DES ENTREPRISES PAR FORUM")
    print("=" * 60)
    
    # 5. Répartition des entreprises par forum
    for forum in forums_with_offers:
        if forum.offer_count > 0:
            # Compter les entreprises uniques dans ce forum
            unique_companies = Offer.objects.filter(
                forum=forum
            ).values_list('company__name', flat=True).distinct()
            
            print(f"🏢 Forum {forum.id} ({forum.name}): {len(unique_companies)} entreprises")
            
            # Afficher les 10 premières entreprises
            companies_list = list(unique_companies)[:10]
            if companies_list:
                print(f"   Entreprises: {', '.join(companies_list)}")
                if len(unique_companies) > 10:
                    print(f"   ... et {len(unique_companies) - 10} autres")
    
    print("\n" + "=" * 60)
    print("DÉTAIL DES ENTREPRISES PAR FORUM")
    print("=" * 60)
    
    # 6. Détail des entreprises dans chaque forum
    for forum in forums_with_offers:
        if forum.offer_count > 0:
            print(f"\n🏢 Forum {forum.id} ({forum.name}):")
            
            # Récupérer les entreprises avec leur nombre d'offres
            companies_in_forum = Offer.objects.filter(
                forum=forum
            ).values(
                'company__name'
            ).annotate(
                offer_count=Count('id')
            ).order_by('-offer_count')
            
            for company in companies_in_forum[:10]:  # Top 10
                print(f"   - {company['company__name']}: {company['offer_count']} offres")
            
            if companies_in_forum.count() > 10:
                print(f"   ... et {companies_in_forum.count() - 10} autres entreprises")
    
    print("\n" + "=" * 60)
    print("VÉRIFICATIONS")
    print("=" * 60)
    
    # 7. Vérification des offres sans forum
    offers_without_forum = Offer.objects.filter(forum__isnull=True).count()
    print(f"⚠️  Offres sans forum: {offers_without_forum}")
    
    # 8. Vérification des offres avec forum inexistant
    offers_with_invalid_forum = Offer.objects.exclude(
        forum__in=Forum.objects.all()
    ).count()
    print(f"⚠️  Offres avec forum inexistant: {offers_with_invalid_forum}")
    
    print("\n" + "=" * 60)
    print("RÉSUMÉ")
    print("=" * 60)
    
    # Résumé
    print(f"📈 Total: {total_forums} forums, {total_companies} entreprises, {total_offers} offres")
    
    # Forum avec le plus d'offres
    forum_with_most_offers = forums_with_offers.order_by('-offer_count').first()
    if forum_with_most_offers and forum_with_most_offers.offer_count > 0:
        print(f"🏆 Forum avec le plus d'offres: Forum {forum_with_most_offers.id} ({forum_with_most_offers.name}) avec {forum_with_most_offers.offer_count} offres")

if __name__ == "__main__":
    check_database()
