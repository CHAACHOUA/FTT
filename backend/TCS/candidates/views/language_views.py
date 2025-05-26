from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from candidates.services.language_services import get_all_languages


@api_view(['GET'])
@permission_classes([AllowAny])
def get_languages_view(request):
    """
    Endpoint public pour récupérer la liste des langues disponibles.
    """
    return get_all_languages()
