from candidates.models import Skill


def update_skills(candidate, data):
    """
    Met à jour les compétences du candidat.
    Clé utilisée : nom de la compétence (case insensitive)
    """
    skills_data = data.get('skills', [])
    incoming_names = {
        (entry.get('name') if isinstance(entry, dict) else entry).strip().lower()
        for entry in skills_data
        if (entry.get('name') if isinstance(entry, dict) else entry)
    }

    existing_skills = {
        skill.name.strip().lower(): skill
        for skill in candidate.skills.all()
    }

    # Ajouter les nouvelles compétences
    for name in incoming_names:
        if name not in existing_skills:
            Skill.objects.create(candidate=candidate, name=name)

    # Supprimer les compétences absentes
    for name, skill in existing_skills.items():
        if name not in incoming_names:
            skill.delete()
