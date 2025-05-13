from django.core.mail import send_mail
from django.core.signing import TimestampSigner
from django.conf import settings
from .models import UserToken

signer = TimestampSigner()

def send_email(subject, message, recipient_email):
    """
    Fonction utilitaire pour envoyer un email.
    """
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=False,
    )


def send_user_token(user, token_type, new_email=None):
    """
    Envoie un email à l'utilisateur avec un lien pour :
    - activer son compte,
    - changer son email,
    - réinitialiser son mot de passe.

    :param user: L'utilisateur concerné.
    :param token_type: Le type de token : "activation", "email_change" ou "password_reset".
    :param new_email: Nouvelle adresse email si applicable (pour "email_change").
    """
    # Supprimer les anciens tokens non utilisés du même type
    UserToken.objects.filter(user=user, type=token_type, is_used=False).delete()

    # Créer un nouveau token
    token = UserToken.objects.create(user=user, type=token_type, email=new_email)
    token_str = signer.sign(token.token)

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

    else:
        return  # Type inconnu, on ne fait rien

    # Envoi de l'e-mail
    send_email(subject, message, recipient_email)
