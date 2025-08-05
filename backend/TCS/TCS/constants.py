# Constants for dropdown choices
# This file centralizes all dropdown options used across the application

SECTOR_CHOICES = [
    ('IT', 'Informatique'),
    ('Marketing', 'Marketing'),
    ('Commerce', 'Commerce'),
    ('RH', 'Ressources Humaines'),
    ('Finance', 'Finance'),
    ('Santé', 'Santé'),
    ('Éducation', 'Éducation'),
    ('BTP', 'BTP / Construction'),
    ('Logistique', 'Logistique / Transport'),
    ('Technologie', 'Technologie / IT'),
    ('Autre', 'Autre'),
]

CONTRACT_CHOICES = [
    ('CDI', 'CDI'),
    ('CDD', 'CDD'),
    ('Stage', 'Stage'),
    ('Contrat d\'apprentissage', 'Contrat d\'apprentissage'),
    ('Contrat de professionnalisation', 'Contrat de professionnalisation'),
]

FORUM_TYPE_CHOICES = [
    ('hybride', 'Hybride'),
    ('presentiel', 'Présentiel'),
    ('virtuel', 'Virtuel'),
]

# Helper function to get choices as list of dictionaries for frontend
def get_sector_choices():
    return [{'value': choice[0], 'label': choice[1]} for choice in SECTOR_CHOICES]

def get_contract_choices():
    return [{'value': choice[0], 'label': choice[1]} for choice in CONTRACT_CHOICES]

def get_forum_type_choices():
    return [{'value': choice[0], 'label': choice[1]} for choice in FORUM_TYPE_CHOICES] 