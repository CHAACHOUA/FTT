from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from users.models import UserToken

from users.utils import send_user_token

signer = TimestampSigner()

def activate_user_account(token):
    """
    Active le compte utilisateur si le token est valide et non utilisé.
    """
    try:
        # Désigne le token signé (valide 24h)
        unsigned_token = signer.unsign(token, max_age=60 * 60 * 24)

        # Récupérer le token utilisateur en base
        user_token = UserToken.objects.get(token=unsigned_token, type="activation", is_used=False)
        user = user_token.user

        # Vérifie si déjà activé
        if user.is_active:
            return Response({"message": "Account already activated."}, status=status.HTTP_200_OK)

        # Activation
        user.is_active = True
        user.save()

        # Marque le token comme utilisé
        user_token.is_used = True
        user_token.save()

        return Response({"message": "Account activated successfully."}, status=status.HTTP_200_OK)

    except SignatureExpired:
        return Response({"error": "The activation link has expired."}, status=status.HTTP_400_BAD_REQUEST)

    except BadSignature:
        return Response({"error": "Invalid activation link."}, status=status.HTTP_400_BAD_REQUEST)

    except UserToken.DoesNotExist:
        return Response({"error": "Invalid or used token."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


User = get_user_model()

def resend_activation_link(email: str):
    """
    Renvoie un email d’activation si l'utilisateur est inactif.
    """
    if not email:
        return Response({"message": "Email requis."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        if user.is_active:
            return Response({"message": "Ce compte est déjà activé."}, status=status.HTTP_400_BAD_REQUEST)

        # Supprimer les anciens tokens d’activation (facultatif, nettoyage)
        UserToken.objects.filter(user=user, type="activation", is_used=False).delete()

        send_user_token(user, token_type="activation")

        return Response({"message": "Lien d’activation renvoyé avec succès."}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"message": "Aucun utilisateur trouvé avec cet email."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)