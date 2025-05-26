from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from candidates.services.upload_services import handle_cv_upload


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_cv_view(request):
    """
    Upload du CV PDF, parsing automatique avec ChatGPT, et sauvegarde dans le profil candidat.
    """
    return handle_cv_upload(request)
