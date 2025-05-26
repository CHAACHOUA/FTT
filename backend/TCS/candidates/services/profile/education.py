from candidates.models import Education




def update_educations(candidate, data):
    """
    Met à jour toutes les formations du candidat : ajout, mise à jour, suppression.
    Clé unique utilisée : (degree, institution, start_date, end_date)
    """
    education_data = data.get('educations', [])

    # Récupérer les formations existantes
    existing = {
        (edu.degree, edu.institution, str(edu.start_date), str(edu.end_date)): edu
        for edu in candidate.educations.all()
    }

    incoming_keys = set()

    for edu_data in education_data:
        key = (
            edu_data.get('degree'),
            edu_data.get('institution'),
            str(edu_data.get('start_date')),
            str(edu_data.get('end_date'))
        )
        incoming_keys.add(key)

        if key not in existing:
            Education.objects.create(
                candidate=candidate,
                degree=edu_data.get('degree'),
                institution=edu_data.get('institution'),
                start_date=edu_data.get('start_date'),
                end_date=edu_data.get('end_date')
            )
        # Sinon : on ne fait rien (pas d'update car la clé est identique)

    # Supprimer celles qui ne sont plus dans le frontend
    for key, edu_obj in existing.items():
        if key not in incoming_keys:
            edu_obj.delete()
