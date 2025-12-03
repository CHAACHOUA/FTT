import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

class ChatService {
  /**
   * Récupérer toutes les conversations de l'utilisateur
   */
  static async getConversations(forumId = null) {
    try {
      const params = forumId ? { forum_id: forumId } : {};
      const response = await axios.get(`${API_BASE_URL}/chat/conversations/`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une conversation
   */
  static async getConversation(conversationId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle conversation
   * @param {number} forumId - ID du forum
   * @param {number} companyId - ID de l'entreprise (pour les candidats)
   * @param {number} candidateId - ID du candidat (pour les recruteurs)
   */
  static async createConversation(forumId, companyId = null, candidateId = null) {
    try {
      const data = {
        forum: forumId
      };

      // Si companyId est fourni, c'est un candidat qui crée
      if (companyId) {
        data.company = companyId;
      }
      // Si candidateId est fourni, c'est un recruteur qui crée
      if (candidateId) {
        data.candidate = candidateId;
      }

      console.log('📤 [ChatService] Envoi création conversation:', data);
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations/create/`,
        data,
        { withCredentials: true }
      );
      console.log('✅ [ChatService] Conversation créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ChatService] Erreur lors de la création de la conversation:', error);
      console.error('❌ [ChatService] Détails:', error.response?.data);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une conversation
   */
  static async updateConversationStatus(conversationId, status) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/status/`,
        { status },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Récupérer les messages d'une conversation
   */
  static async getMessages(conversationId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau message
   */
  static async createMessage(conversationId, content) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/messages/`,
        {
          conversation: conversationId,
          content
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      throw error;
    }
  }

  /**
   * Marquer un message comme lu
   */
  static async markMessageRead(messageId) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/chat/messages/${messageId}/read/`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
      throw error;
    }
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   */
  static async markAllAsRead(conversationId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations/${conversationId}/mark-all-read/`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      throw error;
    }
  }
}

export default ChatService;
