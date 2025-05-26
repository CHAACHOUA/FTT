from rest_framework.response import Response
from rest_framework import status
from candidates.models import Language
from candidates.serializers import LanguageSerializer


def get_all_languages():
    try:
        languages = Language.objects.all()
        serializer = LanguageSerializer(languages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception:
        return Response(
            {"detail": "Erreur lors de la récupération des langues."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
