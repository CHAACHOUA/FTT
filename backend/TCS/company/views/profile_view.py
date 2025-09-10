from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from recruiters.models import Recruiter
from company.services.profile_service import get_company_profile,update_company_profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company_profile_view(request):
    try:
        recruiter = Recruiter.objects.get(user=request.user)
    except Recruiter.DoesNotExist:
        return Response({"message": "Recruteur introuvable."}, status=404)

    company = recruiter.company
    data = get_company_profile(company)
    return Response(data, status=200)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_company_profile_view(request):
    try:
        recruiter = Recruiter.objects.get(user=request.user)
    except Recruiter.DoesNotExist:
        return Response({"message": "Recruteur introuvable."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()

    # Récupérer le logo et banner si présents
    logo = request.FILES.get('logo', None)
    banner = request.FILES.get('banner', None)

    result = update_company_profile(
        company=recruiter.company,
        data=data,
        logo=logo,
        banner=banner
    )

    return Response(result["data"], status=result["status"])