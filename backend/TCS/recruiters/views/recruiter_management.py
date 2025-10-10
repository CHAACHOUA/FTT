from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from recruiters.models import Recruiter
from recruiters.serializers import RecruiterSerializer, RecruiterUpdateSerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64


@api_view(['GET'])
def test_endpoint(request):
    """Endpoint de test pour vérifier la connectivité"""
    return Response({'message': 'Test endpoint working', 'method': request.method}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company_recruiters(request):
    """
    Récupère la liste de tous les recruteurs de la même entreprise que l'utilisateur connecté.
    """
    try:
        current_recruiter = request.user.recruiter_profile
        company = current_recruiter.company
        recruiters = Recruiter.objects.filter(company=company).select_related('user')
        
        # Récupérer le forum depuis les paramètres de requête
        forum_id = request.GET.get('forum_id')
        forum = None
        if forum_id:
            from forums.models import Forum
            try:
                forum = Forum.objects.get(id=forum_id)
            except Forum.DoesNotExist:
                pass
        
        # Passer le forum au contexte du serializer
        serializer = RecruiterSerializer(recruiters, many=True, context={'forum': forum})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Recruiter.DoesNotExist:
        return Response({'error': 'Profil recruteur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_recruiter(request, recruiter_id):
    """
    Met à jour les informations d'un recruteur.
    Seuls les managers peuvent modifier d'autres recruteurs.
    """
    try:
        print(f"=== UPDATE RECRUITER DEBUG ===")
        print(f"Recruiter ID: {recruiter_id}")
        print(f"User: {request.user}")
        print(f"Request data: {request.data}")
        print(f"Request FILES: {request.FILES}")
        print(f"Content-Type: {request.content_type}")
        print(f"Title field: {request.data.get('title', 'NOT_FOUND')}")
        print(f"First name field: {request.data.get('first_name', 'NOT_FOUND')}")
        print(f"Last name field: {request.data.get('last_name', 'NOT_FOUND')}")
        
        # Récupérer le recruteur à modifier
        recruiter_to_update = get_object_or_404(Recruiter, id=recruiter_id)
        current_recruiter = request.user.recruiter_profile
        
        print(f"Recruiter to update: {recruiter_to_update}")
        print(f"Current recruiter: {current_recruiter}")
        
        # Vérifier que le recruteur à modifier appartient à la même entreprise
        if recruiter_to_update.company != current_recruiter.company:
            return Response(
                {'error': 'Vous ne pouvez modifier que les recruteurs de votre entreprise'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier les permissions (modification de son propre profil ou même entreprise)
        if recruiter_to_update != current_recruiter and recruiter_to_update.company != current_recruiter.company:
            return Response(
                {'error': 'Vous ne pouvez modifier que les recruteurs de votre entreprise'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Traitement de l'image si fournie (simplifié)
        print(f"Checking for profile_picture in FILES: {'profile_picture' in request.FILES}")
        print(f"Checking for profile_picture in data: {'profile_picture' in request.data}")
        
        # Pour l'instant, on ignore le traitement d'image pour éviter les erreurs
        # L'image sera gérée automatiquement par Django si elle est dans request.FILES
        
        # Sérialiser et valider les données
        print(f"Data to serialize: {request.data}")
        print(f"Original recruiter data: first_name={recruiter_to_update.first_name}, last_name={recruiter_to_update.last_name}, title={recruiter_to_update.title}")
        
        try:
            serializer = RecruiterUpdateSerializer(recruiter_to_update, data=request.data, partial=True)
            
            print(f"Serializer is valid: {serializer.is_valid()}")
            if not serializer.is_valid():
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            updated_recruiter = serializer.save()
            print(f"Recruiter updated successfully: {updated_recruiter}")
            print(f"Updated data: first_name={updated_recruiter.first_name}, last_name={updated_recruiter.last_name}, title={updated_recruiter.title}")
            print(f"Serializer response data: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as serializer_error:
            print(f"Serializer error: {str(serializer_error)}")
            print(f"Serializer error type: {type(serializer_error)}")
            return Response(
                {'error': f'Erreur lors de la sérialisation: {str(serializer_error)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Recruiter.DoesNotExist:
        print("Recruiter not found")
        return Response({'error': 'Recruteur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"General error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return Response({'error': f'Erreur serveur: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_recruiter(request, recruiter_id):
    """
    Supprime un recruteur.
    Seuls les managers peuvent supprimer d'autres recruteurs.
    """
    try:
        # Récupérer le recruteur à supprimer
        recruiter_to_delete = get_object_or_404(Recruiter, id=recruiter_id)
        current_recruiter = request.user.recruiter_profile
        
        # Vérifier que le recruteur à supprimer appartient à la même entreprise
        if recruiter_to_delete.company != current_recruiter.company:
            return Response(
                {'error': 'Vous ne pouvez supprimer que les recruteurs de votre entreprise'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Empêcher l'auto-suppression
        if recruiter_to_delete == current_recruiter:
            return Response(
                {'error': 'Vous ne pouvez pas supprimer votre propre compte'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Supprimer le recruteur (cela supprimera aussi l'utilisateur associé)
        recruiter_to_delete.delete()
        
        return Response({'message': 'Recruteur supprimé avec succès'}, status=status.HTTP_204_NO_CONTENT)
        
    except Recruiter.DoesNotExist:
        return Response({'error': 'Recruteur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_info(request):
    """
    Récupère les informations de l'utilisateur connecté.
    """
    try:
        current_recruiter = request.user.recruiter_profile
        serializer = RecruiterSerializer(current_recruiter)
        
        # Ajouter des informations supplémentaires
        data = serializer.data
        data['is_manager'] = current_recruiter.recruiter_role == 'manager'
        data['recruiter'] = {
            'id': current_recruiter.id,
            'role': current_recruiter.recruiter_role
        }
        
        return Response(data, status=status.HTTP_200_OK)
    except Recruiter.DoesNotExist:
        return Response({'error': 'Profil recruteur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
