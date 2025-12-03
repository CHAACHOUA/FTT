import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Hook pour gérer la connexion WebSocket des mises à jour de la liste des conversations
 */
const useConversationListWebSocket = (onConversationUpdated) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Récupérer le token WebSocket
  const fetchWebSocketToken = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/websocket-token/`, {
        withCredentials: true
      });
      return response.data.token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token WebSocket:', error);
      return null;
    }
  }, [API_BASE_URL]);

  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const token = await fetchWebSocketToken();
    if (!token) {
      console.error('Impossible d\'obtenir le token WebSocket');
      return;
    }

    try {
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const urlObj = new URL(API_BASE_URL);
      const wsHost = urlObj.host;
      const wsUrl = `${wsProtocol}://${wsHost}/ws/conversations/?token=${token}`;

      console.log('🔌 [CONV_LIST] Connexion WebSocket à:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ [CONV_LIST] WebSocket connecté');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'conversation_list_updated') {
            console.log('📨 [CONV_LIST] Liste mise à jour:', data.conversation_id, data.conversation);
            if (onConversationUpdated) {
              onConversationUpdated(data.conversation_id, data.conversation);
            }
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [CONV_LIST] Erreur WebSocket:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 [CONV_LIST] WebSocket fermé:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`🔄 [CONV_LIST] Tentative de reconnexion ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      return ws;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la connexion WebSocket:', error);
      return null;
    }
  }, [isAuthenticated, API_BASE_URL, fetchWebSocketToken, onConversationUpdated]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socket) {
      socket.close(1000, 'Déconnexion intentionnelle');
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  useEffect(() => {
    if (isAuthenticated) {
      connect().catch(err => console.error('Erreur de connexion WebSocket:', err));
      return () => {
        disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    socket,
    isConnected,
    disconnect,
    connect
  };
};

export default useConversationListWebSocket;
