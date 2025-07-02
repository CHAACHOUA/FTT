def build_candidate_text(candidate):
    skills = " ".join([s.name for s in candidate.skills.all()])
    experiences = " ".join([
        f"{exp.job_title} chez {exp.company} : {exp.description or ''}"
        for exp in candidate.experiences.all()
    ])
    educations = " ".join([
        f"{edu.degree} - {edu.institution}"
        for edu in candidate.educations.all()
    ])
    languages = " ".join([
        f"{cl.language.name}({cl.level})"
        for cl in candidate.candidate_languages.all()
    ])

    candidate_text = (
        f"{candidate.first_name} {candidate.last_name} "
        f"Compétences: {skills} "
        f"Expériences: {experiences} "
        f"Éducation: {educations} "
        f"Langues: {languages}"
    )
    return candidate_text


from recruiters.models import Offer

def get_candidates_texts_for_offer(offer_id):
    try:
        offer = Offer.objects.select_related('forum').get(id=offer_id)
    except Offer.DoesNotExist:
        return {}

    forum_id = offer.forum.id

    from forums.models import ForumRegistration
    registrations = ForumRegistration.objects.filter(forum_id=forum_id).select_related('candidate').prefetch_related(
        'candidate__skills',
        'candidate__experiences',
        'candidate__educations',
        'candidate__candidate_languages__language'
    )

    candidates_texts = {}
    for reg in registrations:
        candidate = reg.candidate
        text = build_candidate_text(candidate)
        candidates_texts[candidate.user_id] = text

    return candidates_texts
