from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from forums.services.forum_services import get_all_forums, get_forum_detail
from rest_framework.response import Response
from forums.services.forum_services import get_candidate_search_by_forum_and_candidate
from forums.serializers import CandidateSearchSerializer
from candidates.models import Candidate
from forums.services.forum_candidate_participation import get_candidates_for_forum
from recruiters.models import RecruiterForumParticipation
from forums.serializers import ForumCandidateSerializer
from forums.services.forum_by_roles import get_candidate_forum_lists, get_recruiter_forum_lists,get_organizer_forum_lists
from forums.models import Forum
from forums.serializers import ForumSerializer
from organizers.models import Organizer
from company.models import ForumCompany
from recruiters.models import Offer



@api_view(['GET'])
def forum_list(request):
    return get_all_forums()


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def forum_detail(request, pk):
    return get_forum_detail(pk)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidate_search_view(request, forum_id):
    """
    Vue API pour récupérer les préférences de recherche d’un candidat pour un forum donné.
    """
    user=request.user
    try:
        candidate = Candidate.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({
            "message": "Profil candidat introuvable."
        }, status=status.HTTP_404_NOT_FOUND)
    try:
        search = get_candidate_search_by_forum_and_candidate(forum_id, candidate)
        if search:
            serializer = CandidateSearchSerializer(search)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Aucune préférence enregistrée."}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_candidates(request, forum_id):
    user = request.user

    if not hasattr(user, 'recruiter_profile'):
        return Response({"error": "Accès réservé aux recruteurs."}, status=status.HTTP_403_FORBIDDEN)

    recruiter = user.recruiter_profile

    is_participant = RecruiterForumParticipation.objects.filter(
        recruiter=recruiter,
        forum_id=forum_id
    ).exists()

    if not is_participant:
        return Response({"error": "Vous n'êtes pas autorisé à accéder à ce forum."}, status=status.HTTP_403_FORBIDDEN)

    try:
        registrations = get_candidates_for_forum(forum_id)
        serializer = ForumCandidateSerializer(registrations, many=True)
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_forum_candidates(request, forum_id):
    user = request.user

    if not hasattr(user, 'organizer_profile'):
        return Response({"error": "Accès réservé aux organisateur."}, status=status.HTTP_403_FORBIDDEN)


    try:
        registrations = get_candidates_for_forum(forum_id)
        serializer = ForumCandidateSerializer(registrations, many=True)
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response(
            {"error": "Une erreur inattendue est survenue."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_forums(request):
    return get_candidate_forum_lists(request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_my_forums(request):
    return get_recruiter_forum_lists(request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_my_forums(request):
    return get_organizer_forum_lists(request.user)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_forum(request, forum_id):
    """
    Permet à un organizer de mettre à jour son forum
    """
    try:
        # Vérifier que l'utilisateur est un organizer
        organizer = Organizer.objects.get(user=request.user)
    except ObjectDoesNotExist:
        return Response({"error": "Accès non autorisé. Seuls les organizers peuvent modifier les forums."}, 
                       status=status.HTTP_403_FORBIDDEN)

    try:
        # Récupérer le forum et vérifier qu'il appartient à l'organizer
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
    except Forum.DoesNotExist:
        # Vérifier si le forum existe mais n'appartient pas à cet organizer
        try:
            Forum.objects.get(id=forum_id)
            return Response({"error": "Vous n'êtes pas autorisé à modifier ce forum."}, 
                           status=status.HTTP_403_FORBIDDEN)
        except Forum.DoesNotExist:
            return Response({"error": "Forum non trouvé."}, 
                           status=status.HTTP_404_NOT_FOUND)

    # Préparer les données pour la mise à jour
    data = request.data.copy()
    
    # Gérer la photo si elle est fournie
    if 'photo' in request.FILES:
        # Supprimer l'ancienne photo si elle existe
        if forum.photo:
            forum.photo.delete(save=False)
        data['photo'] = request.FILES['photo']

    # Valider et sauvegarder
    serializer = ForumSerializer(forum, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Forum mis à jour avec succès",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "error": "Données invalides",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_kpis(request, forum_id):
    """
    Récupère les KPIs d'un forum pour l'organizer
    """
    try:
        # Vérifier que l'utilisateur est un organizer
        organizer = Organizer.objects.get(user=request.user)
    except ObjectDoesNotExist:
        return Response({"error": "Accès non autorisé. Seuls les organizers peuvent accéder aux KPIs."}, 
                       status=status.HTTP_403_FORBIDDEN)

    try:
        # Récupérer le forum et vérifier qu'il appartient à l'organizer
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé ou vous n'êtes pas autorisé à y accéder."}, 
                       status=status.HTTP_404_NOT_FOUND)

    # Compter les entreprises participantes
    companies_count = ForumCompany.objects.filter(forum=forum).count()
    
    # Compter les candidats inscrits
    candidates_count = forum.registrations.count()
    
    # Compter les offres (via les entreprises participantes)
    offers_count = Offer.objects.filter(
        company__in=forum.company_participants.values_list('company', flat=True)
    ).count()

    return Response({
        "companies": companies_count,
        "candidates": candidates_count,
        "offers": offers_count
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forum_offers(request, forum_id):
    """
    Récupère toutes les offres d'un forum avec les informations des recruteurs
    """
    try:
        # Vérifier que l'utilisateur est un organizer
        organizer = Organizer.objects.get(user=request.user)
    except ObjectDoesNotExist:
        return Response({"error": "Accès non autorisé. Seuls les organizers peuvent accéder aux offres."}, 
                       status=status.HTTP_403_FORBIDDEN)

    try:
        # Récupérer le forum et vérifier qu'il appartient à l'organizer
        forum = Forum.objects.get(id=forum_id, organizer=organizer)
    except Forum.DoesNotExist:
        return Response({"error": "Forum non trouvé ou vous n'êtes pas autorisé à y accéder."}, 
                       status=status.HTTP_404_NOT_FOUND)

    # Récupérer toutes les offres du forum avec les informations des recruteurs et entreprises
    offers = Offer.objects.filter(
        forum=forum
    ).select_related(
        'recruiter',
        'company',
        'recruiter__user'
    ).order_by('-created_at')

    # Préparer les données pour la réponse
    offers_data = []
    for offer in offers:
        offers_data.append({
            'id': offer.id,
            'title': offer.title,
            'description': offer.description,
            'location': offer.location,
            'sector': offer.sector,
            'contract_type': offer.contract_type,
            'profile_recherche': offer.profile_recherche,
            'created_at': offer.created_at,
            'company': {
                'id': offer.company.id,
                'name': offer.company.name,
                'website': offer.company.website
            },
            'recruiter': {
                'id': offer.recruiter.id,
                'first_name': offer.recruiter.first_name,
                'last_name': offer.recruiter.last_name,
                'email': offer.recruiter.user.email,
                'phone': offer.recruiter.phone
            }
        })

    return Response(offers_data, status=status.HTTP_200_OK)