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

        # Vérifier si l'utilisateur est un recruteur authentifié
        if user and user.is_authenticated and hasattr(user, 'recruiter_profile'):
            if not forum_id:
                return Response({'detail': 'ID du forum requis pour les recruteurs.'}, status=400)
            
            try:
                recruiter = user.recruiter_profile
                forum = Forum.objects.get(id=forum_id)

                # Vérifier si le recruteur a déjà une relation (meeting) avec ce candidat
                existing_meeting = Meeting.objects.filter(
                    candidate=candidate,
                    recruiter=recruiter,
                    forum=forum
                ).first()

                if not existing_meeting:
                    return Response({
                        'detail': 'Accès refusé. Vous devez d\'abord établir une relation avec ce candidat.'
                    }, status=403)

                # Si la relation existe, on peut afficher le profil
                serializer = CandidateSerializer(candidate)
                return Response(serializer.data)

            except Forum.DoesNotExist:
                return Response({'detail': 'Forum introuvable.'}, status=404)
            except Exception as e:
                print("Erreur lors de la vérification du meeting :", e)
                return Response({'detail': 'Erreur lors de la vérification des permissions.'}, status=500)
        
        # Si l'utilisateur n'est pas un recruteur authentifié, accès refusé
        elif user and user.is_authenticated:
            return Response({
                'detail': 'Accès refusé. Seuls les recruteurs peuvent accéder aux profils candidats.'
            }, status=403)
        
        # Si l'utilisateur n'est pas authentifié, accès refusé
        else:
            return Response({
                'detail': 'Authentification requise pour accéder aux profils candidats.'
            }, status=401)

    except ObjectDoesNotExist:
        return Response({'detail': 'Candidat introuvable.'}, status=404)

    except Exception as e:
        # Catch général pour garantir réponse même si erreur inattendue
        print("Erreur serveur :", e)
        return Response({'detail': 'Erreur interne.'}, status=500)