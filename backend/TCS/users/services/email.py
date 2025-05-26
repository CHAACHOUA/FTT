from rest_framework.response import Response
from rest_framework import status
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from users.models import UserToken, User

signer = TimestampSigner()


def validate_email_change_token(token_str):
    """
    Vérifie et applique un changement d'email si le token est valide.
    """
    try:
        # Désigne le token (valide 24h)
        token = signer.unsign(token_str, max_age=86400)

        # Récupérer le UserToken correspondant
        user_token = UserToken.objects.get(token=token, type="email_change", is_used=False)

        user = user_token.user
        new_email = user_token.email

        # Vérifie si l'email est déjà pris
        if User.objects.filter(email=new_email).exists():
            return Response({"error": "This email is already taken. Please choose another one."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Appliquer le changement
        user.email = new_email
        user.save()

        user_token.is_used = True
        user_token.save()

        return Response({
            'new_email': new_email,
            "message": "Email updated successfully."
        }, status=status.HTTP_200_OK)

    except (SignatureExpired, BadSignature):
        return Response({"error": "The validation link has expired or is invalid."},
                        status=status.HTTP_400_BAD_REQUEST)

    except UserToken.DoesNotExist:
        return Response({"error": "Invalid or used token."},
                        status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
