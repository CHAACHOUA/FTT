from candidates.models import Candidate
from django.core.exceptions import ObjectDoesNotExist


def get_candidate_by_token(token):
    try:
        return Candidate.objects.get(public_token=token)
    except Candidate.DoesNotExist:
        raise ObjectDoesNotExist("Candidat introuvable.")