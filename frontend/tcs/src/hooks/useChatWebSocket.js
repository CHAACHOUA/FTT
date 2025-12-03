import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Hook pour gérer la connexion WebSocket du chat
 */
const useChatWebSocket = (conversationId) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messageCallbackRef = useRef(null);
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
    if (!isAuthenticated || !conversationId) {
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
      const wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${conversationId}/?token=${token}`;

      console.log('🔌 [CHAT] Connexion WebSocket à:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ [CHAT] WebSocket connecté');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat_message') {
            console.log('📨 [CHAT] Nouveau message reçu:', data.message);
            if (data.message && data.message.id && messageCallbackRef.current) {
              messageCallbackRef.current(data.message);
            }
          } else if (data.type === 'typing') {
            if (data.is_typing) {
              setTypingUsers(prev => {
                // Utiliser user_name si disponible, sinon user_email
                const userIdentifier = data.user_name || data.user_email;
                if (!prev.includes(userIdentifier)) {
                  return [...prev, userIdentifier];
                }
                return prev;
              });
            } else {
              // Retirer par user_name ou user_email
              const userIdentifier = data.user_name || data.user_email;
              setTypingUsers(prev => prev.filter(id => id !== userIdentifier));
            }
          } else if (data.type === 'error') {
            console.error('❌ [CHAT] Erreur:', data.message);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [CHAT] Erreur WebSocket:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 [CHAT] WebSocket fermé:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`🔄 [CHAT] Tentative de reconnexion ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
          
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
  }, [isAuthenticated, conversationId, API_BASE_URL, fetchWebSocketToken]);

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

  const sendMessage = useCallback((content) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'chat_message',
        content
      }));
      return true;
    }
    console.warn('⚠️ [CHAT] WebSocket non connecté');
    return false;
  }, [socket]);

  const sendTyping = useCallback((isTyping) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }, [socket]);

  // Fonction pour s'abonner aux nouveaux messages
  const onMessage = useCallback((callback) => {
    messageCallbackRef.current = callback;
    return () => {
      messageCallbackRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && conversationId) {
      connect().catch(err => console.error('Erreur de connexion WebSocket:', err));
      return () => {
        disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversationId]);

  return {
    socket,
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    onMessage,
    disconnect,
    connect
  };
};

export default useChatWebSocket;
