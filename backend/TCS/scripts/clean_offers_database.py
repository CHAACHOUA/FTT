#!/usr/bin/env python
"""
Script pour nettoyer la base de données
Supprime les offres des entreprises qui ne participent pas aux forums
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TCS.settings')
django.setup()

from django.db import transaction
from company.models import Company, ForumCompany
from recruiters.models import Offer
from forums.models import Forum

def clean_offers_database():
    print("=" * 60)
    print("NETTOYAGE DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    # Statistiques avant nettoyage
    total_offers_before = Offer.objects.count()
    total_forums = Forum.objects.count()
    total_companies = Company.objects.count()
    
    print(f"📊 AVANT NETTOYAGE:")
    print(f"   - Total offres: {total_offers_before}")
    print(f"   - Total forums: {total_forums}")
    print(f"   - Total entreprises: {total_companies}")
    
    # Analyser les offres à supprimer
    offers_to_delete = []
    
    for forum in Forum.objects.all():
        print(f"\n🏢 Forum {forum.id} ({forum.name}):")
        
        # Récupérer les entreprises qui participent à ce forum
        participating_companies = set(
            ForumCompany.objects.filter(forum=forum)
            .values_list('company_id', flat=True)
        )
        
        print(f"   Entreprises participantes: {len(participating_companies)}")
        
        # Récupérer les offres de ce forum
        forum_offers = Offer.objects.filter(forum=forum)
        print(f"   Offres dans ce forum: {forum_offers.count()}")
        
        # Identifier les offres à supprimer (entreprises non participantes)
        invalid_offers = forum_offers.exclude(company_id__in=participating_companies)
        invalid_count = invalid_offers.count()
        
        if invalid_count > 0:
            print(f"   ⚠️  Offres à supprimer: {invalid_count}")
            
            # Afficher quelques exemples
            for offer in invalid_offers[:5]:
                print(f"      - {offer.company.name}: {offer.title}")
            if invalid_count > 5:
                print(f"      ... et {invalid_count - 5} autres")
            
            offers_to_delete.extend(list(invalid_offers))
        else:
            print(f"   ✅ Toutes les offres sont valides")
    
    print(f"\n📊 RÉSUMÉ À SUPPRIMER:")
    print(f"   - Nombre d'offres à supprimer: {len(offers_to_delete)}")
    
    if not offers_to_delete:
        print("✅ Aucune offre à supprimer. La base de données est déjà propre.")
        return
    
    # Demander confirmation
    print(f"\n⚠️  ATTENTION: Cette action va supprimer {len(offers_to_delete)} offres.")
    confirmation = input("Voulez-vous continuer? (oui/non): ").lower().strip()
    
    if confirmation not in ['oui', 'o', 'yes', 'y']:
        print("❌ Opération annulée.")
        return
    
    # Supprimer les offres invalides
    print(f"\n🗑️  Suppression des offres invalides...")
    
    with transaction.atomic():
        deleted_count = 0
        for offer in offers_to_delete:
            try:
                print(f"   Suppression: {offer.company.name} - {offer.title}")
                offer.delete()
                deleted_count += 1
            except Exception as e:
                print(f"   ❌ Erreur lors de la suppression de l'offre {offer.id}: {e}")
    
    # Statistiques après nettoyage
    total_offers_after = Offer.objects.count()
    offers_deleted = total_offers_before - total_offers_after
    
    print(f"\n📊 APRÈS NETTOYAGE:")
    print(f"   - Total offres: {total_offers_after}")
    print(f"   - Offres supprimées: {offers_deleted}")
    
    # Vérification finale
    print(f"\n🔍 VÉRIFICATION FINALE:")
    for forum in Forum.objects.all():
        participating_companies = set(
            ForumCompany.objects.filter(forum=forum)
            .values_list('company_id', flat=True)
        )
        
        forum_offers = Offer.objects.filter(forum=forum)
        invalid_offers = forum_offers.exclude(company_id__in=participating_companies)
        
        print(f"   Forum {forum.id}: {forum_offers.count()} offres, {invalid_offers.count()} invalides")
    
    print(f"\n✅ Nettoyage terminé!")

if __name__ == "__main__":
    clean_offers_database()
