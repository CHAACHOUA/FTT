from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT personnalisée qui lit les tokens depuis les cookies HttpOnly
    """
    
    def authenticate(self, request):
        # Essayer d'abord les cookies HttpOnly
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        
        if access_token:
            try:
                # Valider le token depuis le cookie
                validated_token = AccessToken(access_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except (InvalidToken, TokenError):
                # Si le token du cookie est invalide, essayer le header Authorization
                pass
        
        # Fallback vers l'authentification par header Authorization
        return super().authenticate(request)
