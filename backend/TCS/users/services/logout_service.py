from rest_framework.response import Response
from rest_framework import status


def logout_user_view():
    """
    Déconnexion utilisateur - supprime les cookies HttpOnly
    """
    response = Response({
        "message": "Déconnexion réussie"
    }, status=status.HTTP_200_OK)
    
    # Suppression des cookies HttpOnly
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response
