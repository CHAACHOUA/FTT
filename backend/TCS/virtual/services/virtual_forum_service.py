from django.utils import timezone
from forums.models import Forum
from rest_framework.response import Response
from rest_framework import status


class VirtualForumService:
    """
    Service pour gérer les forums virtuels et leurs phases temporelles
    """
    
    @staticmethod
    def get_virtual_forums():
        """
        Retourne tous les forums virtuels
        """
        try:
            virtual_forums = Forum.objects.filter(type='virtuel').order_by('-created_at')
            return virtual_forums
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération des forums virtuels: {str(e)}")
    
    @staticmethod
    def get_forums_by_phase(phase):
        """
        Retourne les forums virtuels selon leur phase actuelle
        """
        try:
            forums = VirtualForumService.get_virtual_forums()
            forums_in_phase = []
            
            for forum in forums:
                if forum.get_current_phase() == phase:
                    forums_in_phase.append(forum)
            
            return forums_in_phase
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération des forums par phase: {str(e)}")
    
    @staticmethod
    def get_forum_phase_info(forum_id):
        """
        Retourne les informations de phase d'un forum virtuel
        """
        try:
            forum = Forum.objects.get(id=forum_id, type='virtuel')
            
            phase_info = {
                'forum_id': forum.id,
                'forum_name': forum.name,
                'current_phase': forum.get_current_phase(),
                'phase_display': forum.get_phase_display(),
                'preparation_start': forum.preparation_start,
                'preparation_end': forum.preparation_end,
                'jobdating_start': forum.jobdating_start,
                'interview_start': forum.interview_start,
                'interview_end': forum.interview_end,
                'is_active': forum.get_current_phase() in ['preparation', 'jobdating', 'interview']
            }
            
            return phase_info
        except Forum.DoesNotExist:
            raise Exception("Forum virtuel non trouvé")
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération des informations de phase: {str(e)}")
    
    @staticmethod
    def update_forum_phases(forum_id, phase_data):
        """
        Met à jour les phases d'un forum virtuel
        """
        try:
            forum = Forum.objects.get(id=forum_id, type='virtuel')
            
            # Mise à jour des phases
            if 'preparation_start' in phase_data:
                forum.preparation_start = phase_data['preparation_start']
            if 'preparation_end' in phase_data:
                forum.preparation_end = phase_data['preparation_end']
            if 'jobdating_start' in phase_data:
                forum.jobdating_start = phase_data['jobdating_start']
            if 'interview_start' in phase_data:
                forum.interview_start = phase_data['interview_start']
            if 'interview_end' in phase_data:
                forum.interview_end = phase_data['interview_end']
            
            forum.save()
            return forum
        except Forum.DoesNotExist:
            raise Exception("Forum virtuel non trouvé")
        except Exception as e:
            raise Exception(f"Erreur lors de la mise à jour des phases: {str(e)}")
    
    @staticmethod
    def validate_phase_sequence(phase_data):
        """
        Valide la séquence des phases (preparation -> jobdating -> interview)
        """
        errors = []
        
        # Vérifier que preparation_start < preparation_end
        if phase_data.get('preparation_start') and phase_data.get('preparation_end'):
            if phase_data['preparation_start'] >= phase_data['preparation_end']:
                errors.append("La fin de préparation doit être après le début de préparation")
        
        # Vérifier que preparation_end < jobdating_start
        if phase_data.get('preparation_end') and phase_data.get('jobdating_start'):
            if phase_data['preparation_end'] >= phase_data['jobdating_start']:
                errors.append("Le début du jobdating doit être après la fin de préparation")
        
        # Vérifier que jobdating_start < interview_start
        if phase_data.get('jobdating_start') and phase_data.get('interview_start'):
            if phase_data['jobdating_start'] >= phase_data['interview_start']:
                errors.append("Le début des entretiens doit être après le début du jobdating")
        
        # Vérifier que interview_start < interview_end
        if phase_data.get('interview_start') and phase_data.get('interview_end'):
            if phase_data['interview_start'] >= phase_data['interview_end']:
                errors.append("La fin des entretiens doit être après le début des entretiens")
        
        return errors
    
    @staticmethod
    def get_forum_phase_permissions(forum_id, user_role):
        """
        Retourne les permissions selon la phase actuelle du forum et le rôle de l'utilisateur
        """
        try:
            forum = Forum.objects.get(id=forum_id, type='virtuel')
            current_phase = forum.get_current_phase()
            
            permissions = {
                'can_prepare': False,
                'can_jobdating': False,
                'can_interview': False,
                'can_view_candidates': False,
                'can_create_offers': False,
                'can_manage_agenda': False
            }
            
            if current_phase == 'preparation':
                if user_role == 'organizer':
                    permissions.update({
                        'can_prepare': True,
                        'can_create_offers': True,
                        'can_manage_agenda': True
                    })
                elif user_role == 'recruiter':
                    permissions.update({
                        'can_prepare': True,
                        'can_create_offers': True,
                        'can_manage_agenda': True
                    })
            
            elif current_phase == 'jobdating':
                if user_role == 'recruiter':
                    permissions.update({
                        'can_jobdating': True,
                        'can_view_candidates': True,
                        'can_manage_agenda': True
                    })
                elif user_role == 'candidate':
                    permissions.update({
                        'can_view_candidates': True
                    })
            
            elif current_phase == 'interview':
                if user_role in ['recruiter', 'candidate']:
                    permissions.update({
                        'can_interview': True,
                        'can_manage_agenda': True
                    })
            
            return permissions
        except Forum.DoesNotExist:
            raise Exception("Forum virtuel non trouvé")
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération des permissions: {str(e)}")
