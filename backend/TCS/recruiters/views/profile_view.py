from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from recruiters.services.profile_service import get_recruiter_profile,get_recruiters_company, update_recruiter_profile
from recruiters.serializers import CompanyApprovalSerializer
from recruiters.models import Recruiter
from forums.models import Forum



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_profile(request):
    return get_recruiter_profile(request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_recruiters_view(request):
    data = get_recruiters_company(request.user)
    if data is None:
        return Response({"detail": "Recruiter non trouvé pour cet utilisateur."}, status=status.HTTP_404_NOT_FOUND)
    return Response(data)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_recruiter_profile_view(request):
    data = update_recruiter_profile(
        user=request.user,
        data=request.data,
        profile_picture=request.FILES.get('profile_picture')
    )
    print(request.FILES.get('profile_picture'))
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_approval_status_view(request):
    """
    Retourne le statut d'approbation de l'entreprise du recruteur pour un forum donné
    """
    try:
        # Récupérer le recruteur
        recruiter = Recruiter.objects.get(user=request.user)
        
        # Récupérer le forum depuis les paramètres de requête
        forum_id = request.query_params.get('forum_id')
        if not forum_id:
            return Response(
                {"error": "forum_id est requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            forum = Forum.objects.get(id=forum_id)
        except Forum.DoesNotExist:
            return Response(
                {"error": "Forum non trouvé"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Sérialiser avec le contexte du forum
        serializer = CompanyApprovalSerializer(
            recruiter, 
            context={'forum': forum}
        )
        
        return Response(serializer.data)
        
    except Recruiter.DoesNotExist:
        return Response(
            {"error": "Recruteur non trouvé"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )