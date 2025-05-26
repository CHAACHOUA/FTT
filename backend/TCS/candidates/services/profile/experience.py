from candidates.models import Experience




def update_experiences(candidate, data):
    """
    Met à jour toutes les expériences du candidat : ajout, mise à jour, suppression.
    La clé unique est composée de (job_title, company, description).
    """
    experience_data = data.get('experiences', [])

    # Crée un dictionnaire des expériences existantes avec clé composite
    existing = {
        (exp.job_title, exp.company, exp.description): exp
        for exp in candidate.experiences.all()
    }

    incoming_keys = set()

    for exp_data in experience_data:
        key = (
            exp_data.get('job_title'),
            exp_data.get('company'),
            exp_data.get('description', '')
        )
        incoming_keys.add(key)

        if key in existing:
            # Mise à jour des dates si différent
            exp_obj = existing[key]
            exp_obj.start_date = exp_data.get('start_date')
            exp_obj.end_date = exp_data.get('end_date')
            exp_obj.save()
        else:
            # Création d'une nouvelle expérience
            Experience.objects.create(
                candidate=candidate,
                job_title=exp_data.get('job_title'),
                company=exp_data.get('company'),
                description=exp_data.get('description', ''),
                start_date=exp_data.get('start_date'),
                end_date=exp_data.get('end_date')
            )

    # Supprimer les anciennes expériences non présentes
    for key, exp_obj in existing.items():
        if key not in incoming_keys:
            exp_obj.delete()
