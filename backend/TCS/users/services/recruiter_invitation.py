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
    print(f"🔧 [BACKEND] Début de send_recruiter_invitation")
    print(f"🔧 [BACKEND] Utilisateur connecté: {request.user.email}, rôle: {request.user.role}")
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        company = data.get('company')
        forum = data.get('forum')
        print(f"🔧 [BACKEND] Données reçues - email: {email}, company: {company}, forum: {forum}")
    except json.JSONDecodeError:
        print(f"🔧 [BACKEND] ERREUR: JSON invalide")
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
    existing_user = User.objects.filter(email=email).first()
    if existing_user:
        print(f"🔧 [BACKEND] Utilisateur existant trouvé: {existing_user.email}, rôle: {existing_user.role}, actif: {existing_user.is_active}")
        
        # Si l'utilisateur existe déjà comme recruteur
        if existing_user.role == 'recruiter':
            # Vérifier s'il a déjà un profil recruteur
            try:
                existing_recruiter = Recruiter.objects.get(user=existing_user)
                print(f"🔧 [BACKEND] Profil recruteur existant trouvé pour {existing_user.email}")
                print(f"🔧 [BACKEND] Renvoi d'invitation autorisé pour recruteur existant")
                # On permet le renvoi d'invitation même si le recruteur existe déjà
                pass
            except Recruiter.DoesNotExist:
                print(f"🔧 [BACKEND] Utilisateur recruteur sans profil, création du profil...")
                # L'utilisateur a le rôle recruteur mais pas de profil, on peut continuer
                pass
        else:
            # L'utilisateur existe avec un autre rôle
            print(f"🔧 [BACKEND] ERREUR: Utilisateur avec rôle différent ({existing_user.role})")
            return Response({
                'error': 'Un utilisateur avec cet email existe déjà avec un rôle différent.',
                'details': f'Cet email est déjà associé à un compte {existing_user.role}.'
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
        # Utiliser l'utilisateur existant ou en créer un nouveau
        if existing_user and existing_user.role == 'recruiter':
            print(f"🔧 [BACKEND] Utilisation de l'utilisateur recruteur existant: {existing_user.email}")
            user = existing_user
        else:
            print(f"🔧 [BACKEND] Création d'un nouvel utilisateur recruteur: {email}")
            # Création de l'utilisateur recruteur (inactif)
            user = User.objects.create_user(
                email=email,
                password=None,  # Pas de mot de passe pour l'instant
                role='recruiter',
                is_active=False
            )

        # Création ou récupération du profil recruteur
        try:
            recruiter = Recruiter.objects.get(user=user)
            print(f"🔧 [BACKEND] Profil recruteur existant trouvé, mise à jour...")
            # Mettre à jour l'entreprise si nécessaire
            if recruiter.company != company_obj:
                recruiter.company = company_obj
                recruiter.save()
                print(f"🔧 [BACKEND] Entreprise mise à jour pour le recruteur")
        except Recruiter.DoesNotExist:
            print(f"🔧 [BACKEND] Création d'un nouveau profil recruteur")
            # Création du profil recruteur (sans first_name et last_name pour l'instant)
            recruiter = Recruiter.objects.create(
                user=user,
                company=company_obj,
                first_name='',  # Sera rempli plus tard
                last_name=''    # Sera rempli plus tard
            )

        # Création ou vérification de la participation au forum
        print(f"🔧 [BACKEND] Création/vérification de la participation au forum...")
        try:
            participation, created = RecruiterForumParticipation.objects.get_or_create(
                recruiter=recruiter,
                forum=forum_obj
            )
            if created:
                print(f"🔧 [BACKEND] Nouvelle participation au forum créée")
            else:
                print(f"🔧 [BACKEND] Participation au forum déjà existante")
        except Exception as e:
            print(f"🔧 [BACKEND] Erreur lors de la création de la participation: {e}")
            raise e

        # Supprimer les anciens tokens d'invitation avant d'en envoyer un nouveau
        print(f"🔧 [BACKEND] Suppression des anciens tokens d'invitation")
        try:
            old_tokens = UserToken.objects.filter(user=user, type="recruiter_invitation", is_used=False)
            deleted_count = old_tokens.count()
            old_tokens.delete()
            print(f"🔧 [BACKEND] {deleted_count} anciens tokens d'invitation supprimés")
        except Exception as e:
            print(f"🔧 [BACKEND] Erreur lors de la suppression des anciens tokens: {e}")

        # Envoi du token d'invitation
        print(f"🔧 [BACKEND] Envoi du token d'invitation")
        try:
            send_user_token(user, token_type="recruiter_invitation")
            print(f"🔧 [BACKEND] Token d'invitation envoyé avec succès")
        except Exception as e:
            print(f"🔧 [BACKEND] Erreur lors de l'envoi du token: {e}")
            print(f"🔧 [BACKEND] Type d'erreur: {type(e).__name__}")
            import traceback
            print(f"🔧 [BACKEND] Traceback: {traceback.format_exc()}")
            raise e

        # Déterminer si c'est un renvoi ou une nouvelle invitation
        is_resend = existing_user and existing_user.role == 'recruiter'
        invitation_type = "Renvoi d'invitation" if is_resend else "Invitation"
        message = f'{invitation_type} envoyé avec succès à {email}'
        
        response_data = {
            'message': message,
            'recruiter_id': recruiter.id,
            'company_id': company_obj.id,
            'forum_id': forum_obj.id,
            'is_resend': is_resend
        }
        print(f"🔧 [BACKEND] Réponse finale: {response_data}")
        return Response(response_data, status=status.HTTP_201_CREATED)

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
    print(f"🔧 [BACKEND] Début de complete_recruiter_registration avec token: {token[:20]}...")
    print(f"🔧 [BACKEND] Méthode HTTP: {request.method}")
    print(f"🔧 [BACKEND] Headers: {dict(request.headers)}")
    
    try:
        # Déchiffrer le token signé (validité 24h)
        print(f"🔧 [BACKEND] Tentative de déchiffrement du token...")
        unsigned_token = signer.unsign(token, max_age=60 * 60 * 24)
        print(f"🔧 [BACKEND] Token déchiffré avec succès: {unsigned_token}")

        # Vérifier l'existence du token et son état
        print(f"🔧 [BACKEND] Recherche du UserToken avec token: {unsigned_token}")
        user_token = UserToken.objects.get(
            token=unsigned_token,
            type="recruiter_invitation",
            is_used=False
        )
        print(f"🔧 [BACKEND] UserToken trouvé: {user_token}")

        user = user_token.user
        print(f"🔧 [BACKEND] Utilisateur trouvé: {user.email}, actif: {user.is_active}")

        if user.is_active:
            return Response({
                'error': 'Ce compte est déjà activé.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Récupérer les données de la requête
        print(f"🔧 [BACKEND] Body de la requête: {request.body}")
        try:
            data = json.loads(request.body)
            password = data.get('password')
            confirm_password = data.get('confirm_password')
            first_name = data.get('first_name', '')  # Optionnel
            last_name = data.get('last_name', '')    # Optionnel
            print(f"🔧 [BACKEND] Données reçues - first_name: {first_name}, last_name: {last_name}")
        except json.JSONDecodeError as e:
            print(f"🔧 [BACKEND] Erreur JSON: {e}")
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
        print(f"🔧 [BACKEND] Activation du compte utilisateur...")
        user.set_password(password)
        user.is_active = True
        user.save()
        print(f"🔧 [BACKEND] Compte utilisateur activé avec succès")

        # Mettre à jour le profil recruteur avec les informations personnelles (optionnelles)
        print(f"🔧 [BACKEND] Mise à jour du profil recruteur...")
        try:
            recruiter = Recruiter.objects.get(user=user)
            if first_name:
                recruiter.first_name = first_name
            if last_name:
                recruiter.last_name = last_name
            recruiter.save()
            print(f"🔧 [BACKEND] Profil recruteur mis à jour avec succès")
        except ObjectDoesNotExist:
            print(f"🔧 [BACKEND] Erreur: Profil recruteur introuvable pour l'utilisateur {user.email}")
            return Response({
                'error': 'Profil recruteur introuvable.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Marquer le token comme utilisé
        print(f"🔧 [BACKEND] Marquage du token comme utilisé...")
        user_token.is_used = True
        user_token.save()
        print(f"🔧 [BACKEND] Token marqué comme utilisé")

        # Générer les tokens JWT
        print(f"🔧 [BACKEND] Génération des tokens JWT...")
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        print(f"🔧 [BACKEND] Tokens JWT générés avec succès")

        # Déterminer le nom à retourner
        if first_name and last_name:
            name = f"{first_name} {last_name}"
        elif first_name:
            name = first_name
        elif last_name:
            name = last_name
        else:
            name = user.email

        print(f"🔧 [BACKEND] Préparation de la réponse finale...")
        print(f"🔧 [BACKEND] Nom: {name}, Rôle: {user.role}")
        response_data = {
            'message': 'Compte recruteur activé avec succès.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'name': name,
            'role': user.role
        }
        print(f"🔧 [BACKEND] Réponse finale: {response_data}")
        return Response(response_data, status=status.HTTP_200_OK)

    except SignatureExpired:
        print(f"🔧 [BACKEND] ERREUR: Le lien d'invitation a expiré")
        return Response({
            'error': 'Le lien d\'invitation a expiré. Veuillez demander un nouveau lien.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except BadSignature:
        print(f"🔧 [BACKEND] ERREUR: Lien d'invitation invalide")
        return Response({
            'error': 'Lien d\'invitation invalide.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except UserToken.DoesNotExist:
        print(f"🔧 [BACKEND] ERREUR: UserToken introuvable ou déjà utilisé")
        return Response({
            'error': 'Ce lien est invalide ou a déjà été utilisé.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"🔧 [BACKEND] ERREUR GÉNÉRALE: {str(e)}")
        print(f"🔧 [BACKEND] Type d'erreur: {type(e).__name__}")
        import traceback
        print(f"🔧 [BACKEND] Traceback: {traceback.format_exc()}")
        return Response({
            'error': 'Une erreur est survenue lors de l\'activation du compte.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 