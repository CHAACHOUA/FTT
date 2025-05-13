import json
import uuid
from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.http import JsonResponse
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from candidates.serializers import CandidateRegistrationSerializer
from .models import User, UserToken, AccountDeletion
from .utils import send_user_token
from candidates.models import Candidate


@api_view(['POST'])
def register_candidate(request):
    print("Payload reçu : ", request.data)
    serializer = CandidateRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        candidate = serializer.save()
        user = candidate.user
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Candidate registered successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email
        }, status=status.HTTP_201_CREATED)
    print("Erreurs de validation :", serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_candidate(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if (email is None) or (password is None):
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, email=email, password=password)

    if not user:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    print(user.role)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'email': user.email
    }, status=status.HTTP_200_OK)


signer = TimestampSigner()

@api_view(['GET'])
def activate_account(request, token):
    try:
        print("Received token (signed):", token)

        # Essayer de dé-signer le token
        unsigned_token = signer.unsign(token, max_age=60 * 60 * 24)  # 24 heures de validité
        print("Unsigned token:", unsigned_token)

        # Trouver le UserToken correspondant au token non signé
        user_token = UserToken.objects.get(token=unsigned_token, type="activation", is_used=False)
        user = user_token.user

        # Vérifier si l'utilisateur est déjà activé
        if user.is_active:
            return Response({"message": "Account already activated."}, status=status.HTTP_200_OK)

        # Activer l'utilisateur et marquer le token comme utilisé
        user.is_active = True
        user.save()

        # Marquer le token comme utilisé
        user_token.is_used = True
        user_token.save()

        # Retourner une réponse de succès
        return Response({"message": "Account activated successfully."}, status=status.HTTP_200_OK)

    except SignatureExpired:
        # Le token a expiré
        return Response({"error": "The activation link has expired."}, status=status.HTTP_400_BAD_REQUEST)

    except BadSignature:
        # Le token est invalide
        return Response({"error": "Invalid activation link."}, status=status.HTTP_400_BAD_REQUEST)

    except UserToken.DoesNotExist:
        # Aucun token trouvé pour l'utilisateur
        return Response({"error": "Invalid or used token."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Erreur générale
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


signer = TimestampSigner()


@api_view(['GET'])
def validate_email_change(request, token_str):
    try:
        # Vérifier et désigner le token signé
        token = signer.unsign(token_str, max_age=86400)  # 86400 secondes = 24 heures

        # Rechercher le token dans la base de données
        user_token = UserToken.objects.get(token=token, type="email_change", is_used=False)

        # Récupérer l'utilisateur et mettre à jour l'email
        user = user_token.user
        new_email = user_token.email  # Assurez-vous d'avoir stocké `new_email` dans le token

        # Vérifier si l'email est déjà utilisé
        if User.objects.filter(email=new_email).exists():
            return Response({
                "error": "This email is already taken. Please choose another one."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mettre à jour l'email de l'utilisateur
        user.email = new_email
        user.save()

        # Marquer le token comme utilisé
        user_token.is_used = True
        user_token.save()

        # Retourner une réponse de succès
        return Response({
            'new_email': new_email,
            "message": "Email updated successfully."
        }, status=status.HTTP_200_OK)

    except (BadSignature, SignatureExpired):
        # Si le token est invalide ou expiré
        return Response({
            "error": "The validation link has expired or is invalid."
        }, status=status.HTTP_400_BAD_REQUEST)

    except UserToken.DoesNotExist:
        # Si le token n'existe pas ou a déjà été utilisé
        return Response({
            "error": "Invalid or used token."
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Gestion des autres erreurs
        return Response({
            "error": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def request_password_reset(request):
    """
    L'utilisateur entre son email pour recevoir un lien de réinitialisation de mot de passe.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not email:
        return JsonResponse({'error': 'Email is required'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'success': 'If the email is registered, a reset link will be sent.'})  # Ne jamais révéler

    send_user_token(user, token_type="password_reset")

    return JsonResponse({'success': 'If the email is registered, a reset link will be sent.'})
@api_view(['POST'])
def reset_password(request, token):
    """
    Permet de réinitialiser le mot de passe via le lien envoyé par e-mail.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    try:
        token_str = signer.unsign(token, max_age=60*60*24)
    except SignatureExpired:
        return JsonResponse({'error': 'Token expired'}, status=400)
    except BadSignature:
        return JsonResponse({'error': 'Invalid token'}, status=400)

    try:
        user_token = UserToken.objects.get(token=token_str, type="password_reset", is_used=False)
    except UserToken.DoesNotExist:
        return JsonResponse({'error': 'Token not found or already used'}, status=404)

    if user_token.created_at < now() - timedelta(hours=24):
        return JsonResponse({'error': 'Token expired'}, status=400)

    try:
        data = json.loads(request.body)
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not new_password or new_password != confirm_password:
        return JsonResponse({'error': 'Passwords do not match'}, status=400)

    user = user_token.user
    user.set_password(new_password)
    user.save()

    user_token.is_used = True
    user_token.save()

    return JsonResponse({'success': 'Password has been reset successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # Vérifie que tous les champs sont présents
    if not old_password or not new_password:
        return Response({"error": "Both old and new passwords are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Vérifie que l'ancien mot de passe est correct
    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Change le mot de passe
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_candidate_account(request):
    user = request.user
    reason = request.data.get("reason")

    if user.role != 'candidate':
        return Response({"error": "Seuls les candidats peuvent supprimer leur compte ici."},
                        status=status.HTTP_403_FORBIDDEN)

    if not reason:
        return Response({"error": "Merci de spécifier une raison de suppression."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Sauvegarde la raison
    AccountDeletion.objects.create(user=user, reason=reason )

    # Récupère le profil candidat
    try:
        candidate = user.candidate_profile
    except Candidate.DoesNotExist:
        candidate = None

    if candidate:
        # Supprime les fichiers
        if candidate.cv_file:
            candidate.cv_file.delete(save=False)

        # Supprime les objets liés (experiences, educations, skills, etc.)
        candidate.experiences.all().delete()
        candidate.educations.all().delete()
        candidate.skills.all().delete()
        candidate.candidate_languages.all().delete()

        # Anonymise le profil candidat
        candidate.first_name = ""
        candidate.last_name = ""
        candidate.phone = ""
        candidate.linkedin = ""
        candidate.education_level = ""
        candidate.preferred_contract_type = ""
        candidate.title = ""
        candidate.save()

    # Anonymise l’utilisateur
    user.email = f"anonyme_{uuid.uuid4()}@anon.com"
    user.set_unusable_password()
    user.is_active = False
    user.save()

    # Supprime les tokens liés
    UserToken.objects.filter(user=user).delete()

    return Response({"message": "Compte candidat supprimé et anonymisé avec succès."}, status=status.HTTP_200_OK)