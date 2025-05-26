from rest_framework.response import Response
from rest_framework import status
from candidates.models import Candidate
from candidates.utils.cv_parser import parse_uploaded_pdf


def handle_cv_upload(request):
    """
    Gère l'upload d'un fichier CV (PDF), le stocke et le parse via OpenAI.
    """
    if not request.user.is_active:
        return Response({
            "error": "Your account is not activated. Please check your email for the activation link."
        }, status=status.HTTP_403_FORBIDDEN)

    file = request.FILES.get('cv')

    if not file:
        return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        candidate = request.user.candidate_profile
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # 📝 Sauvegarde du fichier
    candidate.cv_file = file
    candidate.save()

    # 🤖 Parsing via OpenAI
    parsed_data = parse_uploaded_pdf(file)

    return Response(parsed_data, status=status.HTTP_200_OK)
