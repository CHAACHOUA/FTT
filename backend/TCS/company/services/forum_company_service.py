from django.contrib.auth import get_user_model
from forums.models import Forum
from company.models import Company, ForumCompany
from users.models import User

def add_company_to_forum_service(user, name, forum_id):
    try:
        # Vérifier que l'utilisateur est admin ou organisateur
        if user.role not in ['admin', 'organizer']:
            return {
                'success': False,
                'message': 'Permission refusée. Seuls les admins et organisateurs peuvent ajouter des entreprises.'
            }
        
        # Vérifier que le forum existe
        try:
            forum = Forum.objects.get(id=forum_id)
        except Forum.DoesNotExist:
            return {
                'success': False,
                'message': 'Forum non trouvé'
            }
        
        # Vérifier que l'utilisateur est l'organisateur du forum ou admin
        if user.role != 'admin' and forum.organizer.user != user:
            return {
                'success': False,
                'message': 'Vous n\'êtes pas autorisé à modifier ce forum'
            }
        
        # Créer l'entreprise
        company = Company.objects.create(name=name)
        
        # Ajouter l'entreprise au forum via ForumCompany
        ForumCompany.objects.create(company=company, forum=forum)
        
        return {
            'success': True,
            'message': f'Entreprise "{name}" ajoutée au forum avec succès',
            'company_id': company.id
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Erreur lors de l\'ajout de l\'entreprise: {str(e)}'
        }

def approve_company_service(user, company_id, forum_id, approved=True):
    try:
        print(f"DEBUG: approve_company_service called with user={user}, company_id={company_id}, forum_id={forum_id}, approved={approved}")
        
        # Vérifier que l'utilisateur est admin ou organisateur
        if user.role not in ['admin', 'organizer']:
            print(f"DEBUG: User role {user.role} not authorized")
            return {
                'success': False,
                'message': 'Permission refusée. Seuls les admins et organisateurs peuvent approuver des entreprises.'
            }
        
        # Vérifier que le forum existe
        try:
            forum = Forum.objects.get(id=forum_id)
        except Forum.DoesNotExist:
            return {
                'success': False,
                'message': 'Forum non trouvé'
            }
        
        # Vérifier que l'utilisateur est l'organisateur du forum ou admin
        if user.role != 'admin' and forum.organizer.user != user:
            return {
                'success': False,
                'message': 'Vous n\'êtes pas autorisé à modifier ce forum'
            }
        
        # Vérifier que la participation de l'entreprise au forum existe
        try:
            forum_company = ForumCompany.objects.get(company_id=company_id, forum_id=forum_id)
        except ForumCompany.DoesNotExist:
            return {
                'success': False,
                'message': 'Participation de l\'entreprise au forum non trouvée'
            }
        
        # Mettre à jour le statut d'approbation
        forum_company.approved = approved
        forum_company.save()
        
        return {
            'success': True,
            'message': f'Entreprise {"approuvée" if approved else "rejetée"} avec succès',
            'company_id': company_id,
            'approved': forum_company.approved
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Erreur lors de l\'approbation de l\'entreprise: {str(e)}'
        }

def remove_company_from_forum_service(user, company_id, forum_id):
    try:
        # Vérifier que l'utilisateur est admin ou organisateur
        if user.role not in ['admin', 'organizer']:
            return {
                'success': False,
                'message': 'Permission refusée. Seuls les admins et organisateurs peuvent supprimer des entreprises.'
            }
        
        # Vérifier que le forum existe
        try:
            forum = Forum.objects.get(id=forum_id)
        except Forum.DoesNotExist:
            return {
                'success': False,
                'message': 'Forum non trouvé'
            }
        
        # Vérifier que l'utilisateur est l'organisateur du forum ou admin
        if user.role != 'admin' and forum.organizer.user != user:
            return {
                'success': False,
                'message': 'Vous n\'êtes pas autorisé à modifier ce forum'
            }
        
        # Vérifier que la participation de l'entreprise au forum existe
        try:
            forum_company = ForumCompany.objects.get(company_id=company_id, forum_id=forum_id)
        except ForumCompany.DoesNotExist:
            return {
                'success': False,
                'message': 'Participation de l\'entreprise au forum non trouvée'
            }
        
        # Supprimer la relation ForumCompany
        forum_company.delete()
        
        # Supprimer aussi les relations des recruteurs de cette entreprise avec ce forum
        from recruiters.models import RecruiterForumParticipation
        RecruiterForumParticipation.objects.filter(
            recruiter__company_id=company_id,
            forum_id=forum_id
        ).delete()
        
        return {
            'success': True,
            'message': 'Entreprise supprimée du forum avec succès',
            'company_id': company_id
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Erreur lors de la suppression de l\'entreprise: {str(e)}'
        }