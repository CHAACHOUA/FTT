from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Endpoint de rafraîchissement de token personnalisé qui utilise les cookies HttpOnly
    """
    try:
        # Récupérer le refresh token depuis les cookies
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['REFRESH_COOKIE'])
        
        if not refresh_token:
            return Response({
                "detail": "Refresh token manquant dans les cookies"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Valider et utiliser le refresh token
        refresh = RefreshToken(refresh_token)
        new_access_token = refresh.access_token
        new_refresh_token = refresh
        
        # Créer la réponse avec les nouveaux tokens dans les cookies
        response = Response({
            "message": "Token rafraîchi avec succès"
        }, status=status.HTTP_200_OK)
        
        # Définir les nouveaux cookies HttpOnly
        response.set_cookie(
            settings.SIMPLE_JWT['AUTH_COOKIE'],
            str(new_access_token),
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN']
        )
        
        response.set_cookie(
            settings.SIMPLE_JWT['REFRESH_COOKIE'],
            str(new_refresh_token),
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=settings.SIMPLE_JWT['REFRESH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['REFRESH_COOKIE_SAMESITE'],
            secure=settings.SIMPLE_JWT['REFRESH_COOKIE_SECURE'],
            domain=settings.SIMPLE_JWT['REFRESH_COOKIE_DOMAIN']
        )
        
        return response
        
    except TokenError as e:
        return Response({
            "detail": "Token de rafraîchissement invalide ou expiré"
        }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({
            "detail": "Erreur lors du rafraîchissement du token"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
