from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from recruiters.models import Recruiter
from candidates.models import Candidate
from matching.services.matching_offers_candidates import matching_offer_candidates

from candidates.serializers import CandidateSerializer
from rest_framework.response import Response


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
        return JsonResponse({"status": "no_results", "candidates": []})

    candidates_scores = []
    candidate_users = set()

    for candidates_list in results.values():
        for cand, score in candidates_list:
            candidates_scores.append((cand.user, score))
            candidate_users.add(cand.user)

    candidates_qs = Candidate.objects.filter(user__in=candidate_users).select_related("user").prefetch_related("experiences", "educations", "skills", "candidate_languages")
    user_to_candidate = {cand.user: cand for cand in candidates_qs}

    response_candidates = []
    for cand_user, score in candidates_scores:
        cand = user_to_candidate.get(cand_user)
        if cand:
            serialized = CandidateSerializer(cand).data
            serialized['match_score'] = round(score * 100, 1)
            response_candidates.append(serialized)

    return Response({"candidates": response_candidates}, status=status.HTTP_200_OK)
