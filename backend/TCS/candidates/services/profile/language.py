from candidates.models import CandidateLanguage, Language


def create_languages(candidate, language_data):
    """
    Associe les nouvelles langues au candidat avec leur niveau.
    """
    existing = set(candidate.candidate_languages.values_list('language__name', flat=True))

    for lang in language_data:
        name = lang.get('language')
        level = lang.get('level')
        if name and name not in existing:
            try:
                language_obj = Language.objects.get(name=name)
                CandidateLanguage.objects.create(
                    candidate=candidate,
                    language=language_obj,
                    level=level
                )
            except Language.DoesNotExist:
                continue  # ignore silently


def delete_languages(candidate, language_data):
    """
    Supprime les associations de langues absentes des nouvelles données.
    """
    incoming_names = {lang.get('language') for lang in language_data}
    candidate.candidate_languages.exclude(language__name__in=incoming_names).delete()


def update_languages(candidate, data):
    """
    Met à jour toutes les langues du candidat.
    """
    language_data = data.get('candidate_languages', [])
    create_languages(candidate, language_data)
    delete_languages(candidate, language_data)
