import axios from 'axios';

class ZoomService {
  /**
   * Service pour gérer les réunions Zoom via l'API backend
   */
  
  static async createMeeting(forumId, slotId) {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forumId}/agenda/${slotId}/zoom/`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la réunion Zoom:', error);
      throw error;
    }
  }

  static async getMeetingInfo(forumId, slotId) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forumId}/agenda/${slotId}/zoom/info/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de réunion Zoom:', error);
      throw error;
    }
  }

  static async deleteMeeting(forumId, slotId) {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forumId}/agenda/${slotId}/zoom/delete/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la réunion Zoom:', error);
      throw error;
    }
  }

  static async getUserMeetings(forumId) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forumId}/zoom/meetings/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des réunions Zoom:', error);
      throw error;
    }
  }

  static async joinMeeting(meetingLink) {
    try {
      // Ouvrir le lien Zoom dans un nouvel onglet
      window.open(meetingLink, '_blank');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la réunion Zoom:', error);
      throw error;
    }
  }

  static async copyMeetingLink(meetingLink) {
    try {
      await navigator.clipboard.writeText(meetingLink);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la copie du lien Zoom:', error);
      throw error;
    }
  }

  static formatMeetingTime(startTime, duration) {
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + duration * 60000); // duration en minutes
      
      return {
        start: start.toLocaleString('fr-FR'),
        end: end.toLocaleString('fr-FR'),
        duration: `${duration} minutes`
      };
    } catch (error) {
      console.error('Erreur lors du formatage de l\'heure de réunion:', error);
      return {
        start: 'Heure non disponible',
        end: 'Heure non disponible',
        duration: 'Durée non disponible'
      };
    }
  }

  static getMeetingStatus(meetingInfo) {
    try {
      if (!meetingInfo) return 'unknown';
      
      const now = new Date();
      const startTime = new Date(meetingInfo.start_time);
      const endTime = new Date(startTime.getTime() + meetingInfo.duration * 60000);
      
      if (now < startTime) {
        return 'scheduled';
      } else if (now >= startTime && now <= endTime) {
        return 'in_progress';
      } else {
        return 'completed';
      }
    } catch (error) {
      console.error('Erreur lors de la détermination du statut de réunion:', error);
      return 'unknown';
    }
  }

  static formatMeetingDuration(duration) {
    if (!duration) return 'Durée non disponible';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else {
      return `${minutes}min`;
    }
  }
}

export default ZoomService;
