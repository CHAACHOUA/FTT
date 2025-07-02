from sentence_transformers import SentenceTransformer
from matching.services.candidates import build_candidate_text
from matching.services.offers import build_offer_text
import torch

def matching_offer_candidates(recruiter, offer_id, top_n=10):
    from recruiters.models import Offer
    from forums.models import ForumRegistration

    try:
        offer = Offer.objects.select_related('company', 'forum').get(id=offer_id, company=recruiter.company)
    except Offer.DoesNotExist:
        return {}

    forum_id = offer.forum.id

    registrations = ForumRegistration.objects.filter(forum_id=forum_id).select_related('candidate')
    candidates = [reg.candidate for reg in registrations]

    # Initialiser le modèle SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Construire le texte de l'offre et des candidats
    offer_text = build_offer_text(offer)
    print(offer_text)
    candidate_texts = [build_candidate_text(cand) for cand in candidates]
    print(candidate_texts)

    # Calculer embeddings
    offer_embedding = model.encode(offer_text, convert_to_tensor=True)
    candidate_embeddings = model.encode(candidate_texts, convert_to_tensor=True)

    # Calculer similarité cosine entre l'offre et tous les candidats
    cos_scores = torch.nn.functional.cosine_similarity(offer_embedding.unsqueeze(0), candidate_embeddings)





    scores = []
    for j, cand in enumerate(candidates):
        score = cos_scores[j].item()
        scores.append((cand, score))

    # Trier par score décroissant et garder top_n
    top_candidates = sorted(scores, key=lambda x: x[1], reverse=True)[:top_n]

    # Résultat : {offer.id: [(candidate, score), ...]}
    results = {offer.id: [(cand, round(score, 4)) for cand, score in top_candidates]}

    return results
