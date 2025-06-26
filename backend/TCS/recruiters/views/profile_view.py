from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from recruiters.services.profile_service import get_recruiter_profile,get_recruiters_company, update_recruiter_profile
from rest_framework.response import Response



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