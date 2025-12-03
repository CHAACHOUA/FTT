import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Hook personnalisé pour gérer la connexion WebSocket
 */
const useWebSocket = (url, options = {}) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [wsToken, setWsToken] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
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

    // Récupérer le token WebSocket
    const token = await fetchWebSocketToken();
    if (!token) {
      console.error('Impossible d\'obtenir le token WebSocket');
      return;
    }

    try {
      // Construire l'URL WebSocket (l'URL passée devrait déjà être correcte)
      // Ne pas modifier l'URL car elle est déjà construite correctement dans useNotificationWebSocket
      console.log('🔌 Connexion WebSocket à:', url);
      const ws = new WebSocket(`${url}?token=${token}`);

      ws.onopen = () => {
        console.log('✅ [WS] WebSocket connecté avec succès');
        console.log('✅ [WS] URL:', url);
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (options.onMessage) {
            options.onMessage(data);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WS] Erreur WebSocket:', error);
        console.error('❌ [WS] URL:', url);
        console.error('❌ [WS] ReadyState:', ws.readyState);
        if (options.onError) {
          options.onError(error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 [WS] WebSocket fermé - Code:', event.code, 'Reason:', event.reason);
        console.log('🔌 [WS] WasClean:', event.wasClean);
        setIsConnected(false);
        setSocket(null);

        // Tentative de reconnexion si ce n'est pas une fermeture intentionnelle
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`🔄 [WS] Tentative de reconnexion ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ [WS] Nombre maximum de tentatives de reconnexion atteint');
        }
      };

      return ws;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la connexion WebSocket:', error);
      return null;
    }
  }, [isAuthenticated, url, options, fetchWebSocketToken]);

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

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer le message');
    return false;
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
    lastMessage,
    sendMessage,
    disconnect,
    connect
  };
};

export default useWebSocket;

