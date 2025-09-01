from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from users.models import UserToken
from users.utils import send_user_token

signer = TimestampSigner()

def activate_user_account(token):
    """
    Active le compte utilisateur si le token est valide, non expiré et non utilisé.
    Gère tous les cas d'erreur propres.
    """
    try:
        # 🔓 Déchiffrer le token signé (validité 24h)
        unsigned_token = signer.unsign(token, max_age=60 * 60 * 24)

        # 🔍 Vérifie l'existence du token et son état
        user_token = UserToken.objects.get(
            token=unsigned_token,
            type="activation",
            is_used=False
        )

        user = user_token.user

        if user.is_active:
            return Response(
                {"message": "Ce compte est déjà activé."},
                status=status.HTTP_200_OK
            )

        # ✅ Activer l'utilisateur
        user.is_active = True
        user.save()

        # ✅ Marquer le token comme utilisé
        user_token.is_used = True
        user_token.save()

        return Response(
            {"message": "Compte activé avec succès."},
            status=status.HTTP_200_OK
        )

    except SignatureExpired:
        return Response(
            {"error": "Le lien d’activation a expiré. Veuillez en demander un nouveau."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except BadSignature:
        return Response(
            {"error": "Lien d’activation invalide."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except UserToken.DoesNotExist:
        return Response(
            {"error": "Ce lien est invalide ou a déjà été utilisé."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": "Une erreur est survenue lors de l’activation du compte."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

User = get_user_model()

def resend_activation_link(email: str):
    """
    Renvoie un email d’activation si l'utilisateur est inactif.
    """
    print(f"🔧 [BACKEND] Début de resend_activation_link pour email: {email}")
    
    # Validation de l'email
    if not email or not email.strip():
        print(f"🔧 [BACKEND] ERREUR: Email vide ou invalide")
        return Response({"error": "Email requis."}, status=status.HTTP_400_BAD_REQUEST)

    # Validation du format email
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email.strip()):
        print(f"🔧 [BACKEND] ERREUR: Format d'email invalide")
        return Response({"error": "Format d'email invalide."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        print(f"🔧 [BACKEND] Recherche de l'utilisateur avec email: {email}")
        user = User.objects.get(email=email.strip())
        print(f"🔧 [BACKEND] Utilisateur trouvé: {user.email}, actif: {user.is_active}")

        if user.is_active:
            print(f"🔧 [BACKEND] ERREUR: Compte déjà activé")
            return Response({"error": "Ce compte est déjà activé."}, status=status.HTTP_400_BAD_REQUEST)

        # Supprimer les anciens tokens d'activation (nettoyage)
        print(f"🔧 [BACKEND] Suppression des anciens tokens d'activation")
        old_tokens = UserToken.objects.filter(user=user, type="activation", is_used=False)
        deleted_count = old_tokens.count()
        old_tokens.delete()
        print(f"🔧 [BACKEND] {deleted_count} anciens tokens supprimés")

        # Envoyer le nouveau token d'activation
        print(f"🔧 [BACKEND] Envoi du nouveau token d'activation")
        send_user_token(user, token_type="activation")
        print(f"🔧 [BACKEND] Token d'activation envoyé avec succès")

        return Response({
            "message": "Lien d'activation renvoyé avec succès.",
            "email": user.email
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        print(f"🔧 [BACKEND] ERREUR: Aucun utilisateur trouvé avec cet email")
        return Response({"error": "Aucun utilisateur trouvé avec cet email."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print(f"🔧 [BACKEND] ERREUR GÉNÉRALE: {str(e)}")
        print(f"🔧 [BACKEND] Type d'erreur: {type(e).__name__}")
        import traceback
        print(f"🔧 [BACKEND] Traceback: {traceback.format_exc()}")
        return Response({"error": "Une erreur est survenue lors du renvoi du lien d'activation."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)