import json
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.exceptions import ObjectDoesNotExist
from users.models import User, UserToken
from users.utils import send_user_token
from recruiters.models import Recruiter, RecruiterForumParticipation
from company.models import Company
from forums.models import Forum
from organizers.models import Organizer

signer = TimestampSigner()


def send_recruiter_invitation(request):
    """
    Envoie un lien d'invitation à un recruteur.
    Seuls les organizers, admins et recruiters peuvent effectuer cette action.
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        company = data.get('company')
        forum = data.get('forum')
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    # Validation des données requises
    if not email:
        return Response({
            'error': 'Email requis.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not company:
        return Response({
            'error': 'Données de l\'entreprise requises.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not forum:
        return Response({
            'error': 'Données du forum requises.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Vérification des permissions de l'utilisateur connecté
    user = request.user
    if user.role not in ['admin', 'organizer', 'recruiter']:
        return Response({
            'error': 'Vous n\'avez pas les permissions pour inviter un recruteur.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Vérification si l'email existe déjà
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'Un utilisateur avec cet email existe déjà.'
        }, status=status.HTTP_409_CONFLICT)

    # Récupération ou création de l'entreprise
    company_obj = None
    if isinstance(company, dict) and company.get('id'):
        # Si on a un ID, on récupère l'entreprise existante
        try:
            company_obj = Company.objects.get(id=company['id'])
        except Company.DoesNotExist:
            return Response({
                'error': 'Entreprise introuvable.'
            }, status=status.HTTP_404_NOT_FOUND)
    elif isinstance(company, dict) and company.get('name'):
        # Si on a un nom, on crée ou récupère l'entreprise
        company_obj, created = Company.objects.get_or_create(
            name=company['name'],
            defaults={
                'description': company.get('description', f'Entreprise ajoutée via invitation: {company["name"]}')
            }
        )
    else:
        return Response({
            'error': 'Données d\'entreprise invalides. ID ou nom requis.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Récupération ou création du forum
    forum_obj = None
    if isinstance(forum, dict) and forum.get('id'):
        # Si on a un ID, on récupère le forum existant
        try:
            forum_obj = Forum.objects.get(id=forum['id'])
        except Forum.DoesNotExist:
            return Response({
                'error': 'Forum introuvable.'
            }, status=status.HTTP_404_NOT_FOUND)
    elif isinstance(forum, dict) and forum.get('name'):
        # Si on a un nom, on crée ou récupère le forum
        # Note: Pour créer un forum, on a besoin d'un organizer
        if not forum.get('organizer_id'):
            return Response({
                'error': 'ID de l\'organizer requis pour créer un forum.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            organizer = Organizer.objects.get(id=forum['organizer_id'])
            forum_obj, created = Forum.objects.get_or_create(
                name=forum['name'],
                organizer=organizer,
                defaults={
                    'type': forum.get('type', 'hybride'),
                    'description': forum.get('description', ''),
                    'date': forum.get('date')
                }
            )
        except Organizer.DoesNotExist:
            return Response({
                'error': 'Organizer introuvable.'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({
            'error': 'Données de forum invalides. ID ou nom requis.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Création de l'utilisateur recruteur (inactif)
        user = User.objects.create_user(
            email=email,
            password=None,  # Pas de mot de passe pour l'instant
            role='recruiter',
            is_active=False
        )

        # Création du profil recruteur (sans first_name et last_name pour l'instant)
        recruiter = Recruiter.objects.create(
            user=user,
            company=company_obj,
            first_name='',  # Sera rempli plus tard
            last_name=''    # Sera rempli plus tard
        )

        # Création de la participation au forum
        RecruiterForumParticipation.objects.create(
            recruiter=recruiter,
            forum=forum_obj
        )

        # Envoi du token d'invitation
        send_user_token(user, token_type="recruiter_invitation")

        return Response({
            'message': f'Invitation envoyée avec succès à {email}',
            'recruiter_id': recruiter.id,
            'company_id': company_obj.id,
            'forum_id': forum_obj.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Nettoyage en cas d'erreur
        if 'user' in locals():
            user.delete()
        return Response({
            'error': 'Erreur lors de l\'envoi de l\'invitation.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def complete_recruiter_registration(request, token):
    """
    Permet au recruteur de finaliser son inscription en définissant son mot de passe.
    """
    try:
        # Déchiffrer le token signé (validité 24h)
        unsigned_token = signer.unsign(token, max_age=60 * 60 * 24)

        # Vérifier l'existence du token et son état
        user_token = UserToken.objects.get(
            token=unsigned_token,
            type="recruiter_invitation",
            is_used=False
        )

        user = user_token.user

        if user.is_active:
            return Response({
                'error': 'Ce compte est déjà activé.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Récupérer les données de la requête
        try:
            data = json.loads(request.body)
            password = data.get('password')
            confirm_password = data.get('confirm_password')
            first_name = data.get('first_name', '')  # Optionnel
            last_name = data.get('last_name', '')    # Optionnel
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation du mot de passe
        if not password or not confirm_password:
            return Response({
                'error': 'Mot de passe et confirmation requis.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({
                'error': 'Les mots de passe ne correspondent pas.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({
                'error': 'Le mot de passe doit contenir au moins 8 caractères.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Définir le mot de passe et activer le compte
        user.set_password(password)
        user.is_active = True
        user.save()

        # Mettre à jour le profil recruteur avec les informations personnelles (optionnelles)
        try:
            recruiter = Recruiter.objects.get(user=user)
            if first_name:
                recruiter.first_name = first_name
            if last_name:
                recruiter.last_name = last_name
            recruiter.save()
        except ObjectDoesNotExist:
            return Response({
                'error': 'Profil recruteur introuvable.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Marquer le token comme utilisé
        user_token.is_used = True
        user_token.save()

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email

        # Déterminer le nom à retourner
        if first_name and last_name:
            name = f"{first_name} {last_name}"
        elif first_name:
            name = first_name
        elif last_name:
            name = last_name
        else:
            name = user.email

        return Response({
            'message': 'Compte recruteur activé avec succès.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'name': name,
            'role': user.role
        }, status=status.HTTP_200_OK)

    except SignatureExpired:
        return Response({
            'error': 'Le lien d\'invitation a expiré. Veuillez demander un nouveau lien.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except BadSignature:
        return Response({
            'error': 'Lien d\'invitation invalide.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except UserToken.DoesNotExist:
        return Response({
            'error': 'Ce lien est invalide ou a déjà été utilisé.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Une erreur est survenue lors de l\'activation du compte.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 