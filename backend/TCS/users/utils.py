from django.core.mail import send_mail
from django.core.signing import TimestampSigner
from django.conf import settings
from .models import UserToken

signer = TimestampSigner()

def send_email(subject, message, recipient_email):
    """
    Fonction utilitaire pour envoyer un email.
    """
    try:
        print(f"🔧 [BACKEND] send_email - Tentative d'envoi à {recipient_email}")
        print(f"🔧 [BACKEND] send_email - Sujet: {subject}")
        print(f"🔧 [BACKEND] send_email - FROM: {settings.DEFAULT_FROM_EMAIL}")
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
        print(f"🔧 [BACKEND] send_email - Email envoyé avec succès")
        return True
    except Exception as e:
        print(f"🔧 [BACKEND] send_email - ERREUR: {str(e)}")
        print(f"🔧 [BACKEND] send_email - Type d'erreur: {type(e).__name__}")
        import traceback
        print(f"🔧 [BACKEND] send_email - Traceback: {traceback.format_exc()}")
        raise e


def send_user_token(user, token_type, new_email=None):
    """
    Envoie un email à l'utilisateur avec un lien pour :
    - activer son compte,
    - changer son email,
    - réinitialiser son mot de passe,
    - inviter un recruteur.

    :param user: L'utilisateur concerné.
    :param token_type: Le type de token : "activation", "email_change", "password_reset" ou "recruiter_invitation".
    :param new_email: Nouvelle adresse email si applicable (pour "email_change").
    """
    try:
        print(f"🔧 [BACKEND] send_user_token - Début avec user: {user.email}, type: {token_type}")
        
        # Supprimer les anciens tokens non utilisés du même type
        old_tokens = UserToken.objects.filter(user=user, type=token_type, is_used=False)
        deleted_count = old_tokens.count()
        old_tokens.delete()
        print(f"🔧 [BACKEND] send_user_token - {deleted_count} anciens tokens supprimés")

        # Créer un nouveau token
        print(f"🔧 [BACKEND] send_user_token - Création du nouveau token...")
        token = UserToken.objects.create(user=user, type=token_type, email=new_email)
        print(f"🔧 [BACKEND] send_user_token - Token créé: {token.token}")
        
        token_str = signer.sign(token.token)
        print(f"🔧 [BACKEND] send_user_token - Token signé: {token_str[:20]}...")

        # Choix du lien et contenu en fonction du type
        if token_type == "activation":
            url = f"{settings.FRONTEND_URL}/activate/{token_str}/"
            subject = "Activate your account"
            message = f"Click the link below to activate your account:\n{url}\n\nThis link will expire in 24 hours."
            recipient_email = user.email

        elif token_type == "email_change":
            url = f"{settings.FRONTEND_URL}/validate-email/{token_str}/"
            subject = "Validate your new email address"
            message = f"Click the link below to validate your new email address:\n{url}\n\nThis link will expire in 24 hours."
            recipient_email = new_email if new_email else user.email

        elif token_type == "password_reset":
            url = f"{settings.FRONTEND_URL}/reset-password/{token_str}/"
            subject = "Reset your password"
            message = f"Click the link below to reset your password:\n{url}\n\nThis link will expire in 24 hours."
            recipient_email = user.email

        elif token_type == "recruiter_invitation":
            url = f"{settings.FRONTEND_URL}/complete-recruiter-setup/{token_str}/"
            subject = "Invitation to join our platform as a recruiter"
            message = f"""Vous avez été invité à rejoindre notre plateforme en tant que recruteur.

Cliquez sur le lien ci-dessous pour finaliser votre inscription et définir votre mot de passe :
{url}

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe TCS"""
            recipient_email = user.email

        else:
            print(f"🔧 [BACKEND] send_user_token - Type de token inconnu: {token_type}")
            return  # Type inconnu, on ne fait rien

        # Envoi de l'e-mail
        print(f"🔧 [BACKEND] send_user_token - Envoi de l'email à {recipient_email}")
        print(f"🔧 [BACKEND] send_user_token - Sujet: {subject}")
        print(f"🔧 [BACKEND] send_user_token - URL: {url}")
        
        send_email(subject, message, recipient_email)
        print(f"🔧 [BACKEND] send_user_token - Email envoyé avec succès")
        
    except Exception as e:
        print(f"🔧 [BACKEND] send_user_token - ERREUR: {str(e)}")
        print(f"🔧 [BACKEND] send_user_token - Type d'erreur: {type(e).__name__}")
        import traceback
        print(f"🔧 [BACKEND] send_user_token - Traceback: {traceback.format_exc()}")
        raise e
