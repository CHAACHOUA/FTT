import requests
import json
import base64
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

# Configuration du logger
logger = logging.getLogger(__name__)

class ZoomService:
    """
    Service pour gérer les réunions Zoom via l'API Server-to-Server OAuth
    """
    
    def __init__(self):
        self.account_id = settings.ZOOM_ACCOUNT_ID
        self.client_id = settings.ZOOM_CLIENT_ID
        self.client_secret = settings.ZOOM_CLIENT_SECRET
        self.base_url = 'https://api.zoom.us/v2'
        self.access_token = None
        self.token_expires_at = None
    
    def _get_access_token(self):
        """
        Récupère un token d'accès Zoom via Server-to-Server OAuth
        """
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            logger.info(f"✅ Using cached access token")
            return self.access_token
        
        logger.info(f"🔍 Requesting new Zoom access token...")
        logger.info(f"🔍 Account ID: {self.account_id}")
        logger.info(f"🔍 Client ID: {self.client_id}")
        
        # Encoder les credentials
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'account_credentials',
            'account_id': self.account_id
        }
        
        logger.info(f"🔍 Token request data: {data}")
        
        try:
            response = requests.post(
                'https://zoom.us/oauth/token',
                headers=headers,
                data=data,
                timeout=10
            )
            
            logger.info(f"🔍 Token response status: {response.status_code}")
            logger.info(f"🔍 Token response headers: {dict(response.headers)}")
            
            response.raise_for_status()
            
            token_data = response.json()
            logger.info(f"🔍 Token response data: {json.dumps(token_data, indent=2)}")
            
            self.access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)  # 1 min de marge
            
            logger.info(f"✅ Access token obtained successfully, expires in {expires_in} seconds")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Token request failed: {str(e)}")
            logger.error(f"❌ Response status: {getattr(e.response, 'status_code', 'N/A')}")
            logger.error(f"❌ Response text: {getattr(e.response, 'text', 'N/A')}")
            raise Exception(f"Erreur lors de l'obtention du token Zoom: {str(e)}")
    
    def create_meeting(self, slot):
        """
        Crée une réunion Zoom pour un créneau
        
        Args:
            slot: Instance du VirtualAgendaSlot
            
        Returns:
            dict: Informations de la réunion créée
        """
        logger.info(f"🔗 ZoomService.create_meeting called for slot {slot.id}")
        
        if not slot.candidate:
            logger.error("❌ Slot has no candidate assigned")
            raise ValueError("Le créneau doit avoir un candidat assigné")
        
        if slot.type != 'video':
            logger.error(f"❌ Slot is not video type: {slot.type}")
            raise ValueError("Le créneau doit être de type vidéo")
        
        try:
            logger.info(f"🔍 Getting Zoom access token...")
            access_token = self._get_access_token()
            logger.info(f"✅ Access token obtained successfully")
        except Exception as e:
            logger.error(f"❌ Failed to get Zoom access token: {str(e)}")
            logger.warning(f"⚠️ Creating fallback meeting link instead...")
            return self._create_fallback_meeting_link(slot)
        
        # Préparer les données de la réunion
        start_time = datetime.combine(slot.date, slot.start_time)
        logger.info(f"🔍 Meeting start time: {start_time}")
        
        meeting_data = {
            'topic': f'Entretien TCS - {slot.recruiter.email if slot.recruiter else "Recruteur"}',
            'type': 2,  # Réunion planifiée
            'start_time': start_time.isoformat(),
            'duration': slot.duration,
            'timezone': 'Europe/Paris',
            'agenda': f'Entretien pour le créneau du {slot.date}',
            'settings': {
                'host_video': True,
                'participant_video': True,
                'cn_meeting': False,
                'in_meeting': False,
                'join_before_host': True,
                'mute_upon_entry': False,
                'watermark': False,
                'use_pmi': False,
                'approval_type': 0,  # Automatique
                # Utiliser uniquement VoIP pour éviter les exigences PSTN/pays
                'audio': 'voip',
                'auto_recording': 'none',
                'enforce_login': False,
                'enforce_login_domains': '',
                'alternative_hosts': '',
                'close_registration': False,
                'show_share_button': True,
                'allow_multiple_devices': True,
                'registrants_confirmation_email': False,
                'waiting_room': False,
                'request_permission_to_unmute_participants': False,
                # Supprimé global_dial_in_countries pour éviter l'erreur "Country code FR is not available"
                'registrants_email_notification': False
            }
        }
        
        logger.info(f"🔍 Meeting data prepared: {json.dumps(meeting_data, indent=2)}")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            logger.info(f"🔍 Sending request to Zoom API...")
            response = requests.post(
                f'{self.base_url}/users/me/meetings',
                headers=headers,
                json=meeting_data,
                timeout=10
            )
            
            logger.info(f"🔍 Zoom API response status: {response.status_code}")
            logger.info(f"🔍 Zoom API response headers: {dict(response.headers)}")
            
            response.raise_for_status()
            
            meeting_info = response.json()
            logger.info(f"🔍 Raw Zoom API response: {json.dumps(meeting_info, indent=2)}")
            
            # Retourner les informations formatées
            result = {
                'meeting_id': meeting_info['id'],
                'meeting_link': meeting_info['join_url'],
                'host_link': meeting_info['start_url'],
                'password': meeting_info.get('password', ''),
                'topic': meeting_info['topic'],
                'start_time': meeting_info['start_time'],
                'duration': meeting_info['duration'],
                'timezone': meeting_info['timezone'],
                'created_at': meeting_info['created_at'],
                'settings': meeting_info['settings']
            }
            
            logger.info(f"✅ Zoom meeting created successfully!")
            logger.info(f"🔗 Meeting ID: {result['meeting_id']}")
            logger.info(f"🔗 Meeting Link: {result['meeting_link']}")
            logger.info(f"🔗 Host Link: {result['host_link']}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Zoom API request failed: {str(e)}")
            logger.error(f"❌ Response status: {getattr(e.response, 'status_code', 'N/A')}")
            logger.error(f"❌ Response text: {getattr(e.response, 'text', 'N/A')}")
            raise Exception(f"Erreur lors de la création de la réunion Zoom: {str(e)}")
    
    def _create_fallback_meeting_link(self, slot):
        """
        Crée un lien de réunion de fallback quand l'API Zoom échoue
        """
        logger.info(f"🔗 Creating fallback meeting link for slot {slot.id}")
        
        # Générer un ID de réunion unique basé sur le slot
        meeting_id = f"tcs-{slot.id}-{slot.date.strftime('%Y%m%d')}-{slot.start_time.strftime('%H%M')}"
        
        # Créer un lien Zoom générique (l'utilisateur devra créer la réunion manuellement)
        fallback_link = f"https://zoom.us/j/{meeting_id}"
        
        result = {
            'meeting_id': meeting_id,
            'meeting_link': fallback_link,
            'host_link': fallback_link,
            'password': '',
            'topic': f'Entretien TCS - {slot.recruiter.email if slot.recruiter else "Recruteur"}',
            'start_time': datetime.combine(slot.date, slot.start_time).isoformat(),
            'duration': slot.duration,
            'timezone': 'Europe/Paris',
            'created_at': datetime.now().isoformat(),
            'settings': {},
            'fallback': True
        }
        
        logger.info(f"✅ Fallback meeting link created: {fallback_link}")
        logger.warning(f"⚠️ This is a fallback link - the recruiter will need to create the actual Zoom meeting")
        
        return result
    
    def get_meeting_info(self, meeting_id):
        """
        Récupère les informations d'une réunion Zoom
        
        Args:
            meeting_id: ID de la réunion Zoom
            
        Returns:
            dict: Informations de la réunion
        """
        access_token = self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(
                f'{self.base_url}/meetings/{meeting_id}',
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Erreur lors de la récupération de la réunion Zoom: {str(e)}")
    
    def delete_meeting(self, meeting_id):
        """
        Supprime une réunion Zoom
        
        Args:
            meeting_id: ID de la réunion Zoom
        """
        access_token = self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.delete(
                f'{self.base_url}/meetings/{meeting_id}',
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            
            return True
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Erreur lors de la suppression de la réunion Zoom: {str(e)}")
    
    def get_meeting_participants_info(self, slot):
        """
        Récupère les informations des participants pour la réunion
        
        Args:
            slot: Instance du VirtualAgendaSlot
            
        Returns:
            dict: Informations des participants
        """
        participants = {
            'recruiter': {
                'id': slot.recruiter.id,
                'name': self._get_user_display_name(slot.recruiter),
                'email': slot.recruiter.email,
                'role': 'host'
            },
            'candidate': {
                'id': slot.candidate.id,
                'name': self._get_user_display_name(slot.candidate),
                'email': slot.candidate.email,
                'role': 'participant'
            } if slot.candidate else None
        }
        
        return participants
    
    def _get_user_display_name(self, user):
        """
        Récupère le nom d'affichage d'un utilisateur
        """
        if hasattr(user, 'candidate_profile'):
            profile = user.candidate_profile
            return f"{profile.first_name} {profile.last_name}".strip()
        elif hasattr(user, 'recruiter_profile'):
            profile = user.recruiter_profile
            return f"{profile.first_name} {profile.last_name}".strip()
        else:
            return user.email
