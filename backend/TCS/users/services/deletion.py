import uuid
from rest_framework.response import Response
from rest_framework import status
from users.models import AccountDeletion, UserToken
from candidates.models import Candidate
from recruiters.models import Recruiter
from organizers.models import Organizer

def delete_candidate_account_and_data(user, reason):
    """
    Supprime et anonymise le compte d'un candidat :
    - vérifie son rôle
    - enregistre la raison
    - supprime les fichiers et données liées
    - anonymise l'utilisateur
    - supprime les tokens
    """
    if user.role != 'candidate':
        return Response({"error": "Seuls les candidats peuvent supprimer leur compte ici."},
                        status=status.HTTP_403_FORBIDDEN)

    if not reason:
        return Response({"error": "Merci de spécifier une raison de suppression."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Enregistre la demande de suppression
    AccountDeletion.objects.create(user=user, reason=reason)

    try:
        candidate = user.candidate_profile
    except Candidate.DoesNotExist:
        candidate = None

    if candidate:
        # Supprime les fichiers CV
        if candidate.cv_file:
            candidate.cv_file.delete(save=False)

        # Supprime les objets liés
        candidate.experiences.all().delete()
        candidate.educations.all().delete()
        candidate.skills.all().delete()
        candidate.candidate_languages.all().delete()

        # Anonymise le profil
        candidate.first_name = ""
        candidate.last_name = ""
        candidate.phone = ""
        candidate.linkedin = ""
        candidate.education_level = ""
        candidate.preferred_contract_type = ""
        candidate.title = ""
        candidate.save()

    # Anonymise l'utilisateur
    user.email = f"anonyme_{uuid.uuid4()}@anon.com"
    user.set_unusable_password()
    user.is_active = False
    user.save()

    # Supprime les anciens tokens
    UserToken.objects.filter(user=user).delete()

    return Response({"message": "Compte candidat supprimé et anonymisé avec succès."}, status=status.HTTP_200_OK)

def delete_recruiter_account_and_data(user, reason):
    """
    Supprime et anonymise le compte d'un recruteur :
    - vérifie son rôle
    - enregistre la raison
    - supprime les fichiers liés (photo)
    - anonymise le profil recruteur
    - anonymise l'utilisateur
    - supprime les tokens
    """
    if user.role != 'recruiter':
        return Response({"error": "Seuls les recruteurs peuvent supprimer leur compte ici."},
                        status=status.HTTP_403_FORBIDDEN)

    # Enregistre la demande de suppression
    AccountDeletion.objects.create(user=user, reason=reason)

    try:
        recruiter = user.recruiter_profile
    except Recruiter.DoesNotExist:
        recruiter = None

    if recruiter:
        if recruiter.profile_picture:
            recruiter.profile_picture.delete(save=False)

        recruiter.first_name = ""
        recruiter.last_name = ""
        recruiter.phone = ""
        recruiter.title = ""
        recruiter.save()

    # Anonymise l'utilisateur
    user.email = f"anonyme_{uuid.uuid4()}@anon.com"
    user.set_unusable_password()
    user.is_active = False
    user.save()

    # Supprime les anciens tokens
    UserToken.objects.filter(user=user).delete()

    return Response({"message": "Compte recruteur supprimé et anonymisé avec succès."}, status=status.HTTP_200_OK)

def delete_organizer_account_and_data(user, reason):
    """
    Supprime et anonymise le compte d'un organizer :
    - vérifie son rôle
    - enregistre la raison
    - supprime les fichiers liés (logo)
    - anonymise le profil organizer
    - anonymise l'utilisateur
    - supprime les tokens
    """
    if user.role != 'organizer':
        return Response({"error": "Seuls les organizers peuvent supprimer leur compte ici."},
                        status=status.HTTP_403_FORBIDDEN)

    if not reason:
        return Response({"error": "Merci de spécifier une raison de suppression."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Enregistre la demande de suppression
    AccountDeletion.objects.create(user=user, reason=reason)

    try:
        organizer = user.organizer_profile
    except Organizer.DoesNotExist:
        organizer = None

    if organizer:
        # Supprime le logo
        if organizer.logo:
            organizer.logo.delete(save=False)

        # Anonymise le profil
        organizer.name = ""
        organizer.phone_number = ""
        organizer.save()

    # Anonymise l'utilisateur
    user.email = f"anonyme_{uuid.uuid4()}@anon.com"
    user.set_unusable_password()
    user.is_active = False
    user.save()

    # Supprime les anciens tokens
    UserToken.objects.filter(user=user).delete()

    return Response({"message": "Compte organizer supprimé et anonymisé avec succès."}, status=status.HTTP_200_OK)