from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from candidates.services.public_profile import get_candidate_by_token
from candidates.serializers import CandidateSerializer
from recruiters.models import Meeting

from forums.models import Forum
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_token(request):
    user = request.user
    if hasattr(user, 'candidate_profile'):
        return Response({
            "public_token": str(user.candidate_profile.public_token)
        })
    return Response({"detail": "Profil candidat non trouvé."}, status=404)

@api_view(['GET'])
@authentication_classes([BasicAuthentication, TokenAuthentication, JWTAuthentication])
@permission_classes([AllowAny])
def public_candidate_view(request, token):
    try:
        candidate = get_candidate_by_token(token)
        forum_id = request.query_params.get('forum')
        user = request.user

        if user and user.is_authenticated and hasattr(user, 'recruiter_profile') and forum_id:
            try:
                recruiter = user.recruiter_profile
                forum = Forum.objects.get(id=forum_id)

                # Crée le meeting s’il n’existe pas déjà
                Meeting.objects.get_or_create(
                    candidate=candidate,
                    recruiter=recruiter,
                    forum=forum,
                    company=recruiter.company
                )
            except Exception as e:
                # Log en silence si meeting échoue, mais ne bloque jamais
                print("Erreur lors de la création du meeting :", e)

        serializer = CandidateSerializer(candidate)
        return Response(serializer.data)

    except ObjectDoesNotExist:
        return Response({'detail': 'Candidat introuvable.'}, status=404)

    except Exception as e:
        # Catch général pour garantir réponse même si erreur inattendue
        print("Erreur serveur :", e)
        return Response({'detail': 'Erreur interne.'}, status=200)  # Important : ne jamais renvoyer 403/500