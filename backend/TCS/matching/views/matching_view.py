from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from recruiters.models import Recruiter
from candidates.models import Candidate
from matching.services.matching_offers_candidates import matching_offer_candidates

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_matching(request, offer_id):
    user = request.user
    try:
        recruiter = user.recruiter_profile
    except Recruiter.DoesNotExist:
        return JsonResponse({"error": "Vous n'êtes pas un recruteur."}, status=403)

    results = matching_offer_candidates(recruiter, offer_id)

    if not results:
        return JsonResponse({"status": "no_results"})

    candidates_scores = []
    candidate_users = set()

    for candidates_list in results.values():
        for cand, score in candidates_list:
            candidates_scores.append((cand.user, score))
            candidate_users.add(cand.user)

    candidates_qs = Candidate.objects.filter(user__in=candidate_users)
    user_to_candidate = {cand.user: cand for cand in candidates_qs}

    response_candidates = []
    for cand_user, score in candidates_scores:
        cand = user_to_candidate.get(cand_user)
        if cand:
            full_name = f"{cand.first_name} {cand.last_name}"
            percent_score = round(score * 100, 1)
            response_candidates.append({
                "full_name": full_name,
                "match_score": f"{percent_score}%"
            })
        print(response_candidates)

    return JsonResponse({"status": "success", "candidates": response_candidates})
