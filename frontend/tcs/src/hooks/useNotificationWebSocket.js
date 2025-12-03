import { useEffect, useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';
import { useAuth } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';

/**
 * Hook spécialisé pour les notifications via WebSocket
 */
const useNotificationWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  // URL WebSocket - utiliser ws:// pour localhost, wss:// pour production
  // Note: Les WebSocket ne passent pas par /api/, ils sont gérés directement par ASGI
  const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
  // Extraire le host et le port (sans /api/)
  const urlObj = new URL(API_BASE_URL);
  const wsHost = urlObj.host; // Inclut le port si présent (ex: localhost:8000)
  const wsUrl = `${wsProtocol}://${wsHost}/ws/notifications/`;
  
  // Debug: afficher l'URL WebSocket
  console.log('🔌 URL WebSocket construite:', wsUrl);

  const handleMessage = useCallback((data) => {
    console.log('📨 Message WebSocket reçu:', data);
    
    switch (data.type) {
      case 'unread_count':
        console.log('🔢 Mise à jour du compteur:', data.count);
        setUnreadCount(data.count || 0);
        break;
      
      case 'new_notification':
        console.log('🆕 Nouvelle notification reçue:', data.notification);
        setNewNotification(data.notification);
        // Ne pas incrémenter manuellement, attendre le message unread_count du serveur
        break;
      
      case 'notification_updated':
        if (data.unread_count !== undefined) {
          console.log('🔢 Mise à jour du compteur (updated):', data.unread_count);
          setUnreadCount(data.unread_count);
        }
        if (data.notification) {
          setNewNotification(data.notification);
        }
        break;
      
      case 'notifications':
        // Liste de notifications (si demandée)
        break;
      
      default:
        console.log('Type de message non géré:', data.type);
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
    onError: (error) => {
      console.error('Erreur WebSocket notifications:', error);
    },
    maxReconnectAttempts: 10,
    reconnectInterval: 3000
  });

  // Récupérer le compteur initial via API REST (fallback)
  useEffect(() => {
    if (isAuthenticated) {
      const fetchInitialCount = async () => {
        try {
          console.log('📊 [NOTIF] Tentative de récupération du compteur initial...');
          const count = await NotificationService.getUnreadCount();
          console.log('📊 [NOTIF] Compteur initial récupéré via API:', count, 'Type:', typeof count);
          setUnreadCount(count);
        } catch (error) {
          console.error('❌ [NOTIF] Erreur lors de la récupération du compteur initial:', error);
          console.error('❌ [NOTIF] Détails de l\'erreur:', error.response?.data || error.message);
          // En cas d'erreur, initialiser à 0
          setUnreadCount(0);
        }
      };
      fetchInitialCount();
    } else {
      console.log('⚠️ [NOTIF] Utilisateur non authentifié, compteur initialisé à 0');
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Demander le nombre de notifications non lues au moment de la connexion WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 WebSocket connecté, demande du compteur...');
      sendMessage({ type: 'get_unread_count' });
    }
  }, [isConnected, sendMessage]);

  // Réinitialiser la nouvelle notification après traitement
  const clearNewNotification = useCallback(() => {
    setNewNotification(null);
  }, []);

  return {
    isConnected,
    unreadCount,
    newNotification,
    clearNewNotification,
    sendMessage
  };
};

export default useNotificationWebSocket;

