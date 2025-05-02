from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services.parser import parse_uploaded_pdf
from users.models import Candidate


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_cv(request):
    file = request.FILES.get('cv')

    if not file:
        return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)
    candidate.cv_file = file
    candidate.save()
    parsed_data = parse_uploaded_pdf(file)

    return Response(parsed_data, status=status.HTTP_200_OK)
