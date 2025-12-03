import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class NotificationService {
  /**
   * Récupère la liste des notifications
   */
  static async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.is_read !== undefined) {
        queryParams.append('is_read', params.is_read);
      }
      if (params.priority) {
        queryParams.append('priority', params.priority);
      }
      if (params.page) {
        queryParams.append('page', params.page);
      }
      
      const url = `${API_BASE_URL}/notifications/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await axios.get(url, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  static async getUnreadCount() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread-count/`,
        { withCredentials: true }
      );
      return response.data.count;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications:', error);
      return 0;
    }
  }

  /**
   * Marque une notification comme lue
   */
  static async markAsRead(notificationId) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/mark-read/`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  static async markAllAsRead() {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications/mark-all-read/`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  /**
   * Supprime une notification
   */
  static async deleteNotification(notificationId) {
    try {
      await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}/delete/`,
        { withCredentials: true }
      );
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
}

export default NotificationService;

