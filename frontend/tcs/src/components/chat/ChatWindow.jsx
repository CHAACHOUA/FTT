import React, { useState, useEffect, useRef } from 'react';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import ChatService from '../../services/ChatService';
import { useUser } from '../../hooks/useUser';
import './ChatWindow.css';

const ChatWindow = ({ conversation, onClose, onConversationUpdate }) => {
  const { user, isRecruiter, isCandidate } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const processedMessageIdsRef = useRef(new Set());

  const {
    isConnected,
    onMessage,
    typingUsers,
    sendMessage: sendWSMessage,
    sendTyping
  } = useChatWebSocket(conversation?.id || null);

  // Charger les messages initiaux
  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      processedMessageIdsRef.current.clear();
    }
  }, [conversation?.id]);

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (!onMessage || !conversation?.id) return;

    const handleNewMessage = (message) => {
      const msgId = String(message.id);
      
      // Éviter les doublons
      if (processedMessageIdsRef.current.has(msgId)) {
        return;
      }

      processedMessageIdsRef.current.add(msgId);

      setMessages(prev => {
        // Vérifier si le message existe déjà
        const exists = prev.find(m => String(m.id) === msgId);
        if (exists) {
          return prev;
        }

        // Remplacer les messages temporaires
        const filtered = prev.filter(m => {
          if (m.id && String(m.id).startsWith('temp_')) {
            return m.content !== message.content || 
                   (m.sender?.id !== message.sender?.id);
          }
          return true;
        });

        // Ajouter et trier
        const allMessages = [...filtered, message].sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at);
        });

        // Marquer comme lu si ce n'est pas notre message
        if (message.sender?.id && user?.id && message.sender.id !== user.id) {
          ChatService.markAllAsRead(conversation.id).catch(console.error);
          // Ne plus appeler onConversationUpdate - le WebSocket gère les mises à jour
        }

        return allMessages;
      });
    };

    const unsubscribe = onMessage(handleNewMessage);
    return unsubscribe;
  }, [onMessage, conversation?.id, user?.id]);

  // Scroll automatique
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      setLoading(true);
      const data = await ChatService.getMessages(conversation.id);
      const loadedMessages = data || [];
      
      // Marquer tous les messages comme traités
      loadedMessages.forEach(m => {
        if (m?.id) {
          processedMessageIdsRef.current.add(String(m.id));
        }
      });
      
      setMessages(loadedMessages);
      await ChatService.markAllAsRead(conversation.id);
      
      // Ne plus appeler onConversationUpdate ici - le WebSocket gère les mises à jour
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation?.id) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Message temporaire pour feedback instantané
    const tempId = `temp_${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: messageContent,
      sender: { id: user.id, email: user.email },
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Essayer WebSocket d'abord
      if (isConnected && sendWSMessage) {
        const sent = sendWSMessage(messageContent);
        if (sent) {
          return; // Le message réel arrivera via WebSocket
        }
      }
      
      // Fallback REST
      const newMessageData = await ChatService.createMessage(conversation.id, messageContent);
      
      // Remplacer le temporaire par le vrai message
      setMessages(prev => {
        const filtered = prev.filter(m => String(m.id) !== tempId);
        return [...filtered, newMessageData].sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at);
        });
      });

      if (newMessageData?.id) {
        processedMessageIdsRef.current.add(String(newMessageData.id));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(m => String(m.id) !== tempId));
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (isConnected && sendTyping) {
      sendTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    }
  };

  const getOtherUser = () => {
    if (!conversation) return null;
    
    if (isRecruiter()) {
      return conversation.candidate;
    }
    if (isCandidate()) {
      return conversation.company;
    }
    return conversation.candidate || conversation.company;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!conversation || !conversation.id) {
    return (
      <div className="chat-window">
        <div className="chat-empty">Sélectionnez une conversation</div>
      </div>
    );
  }
  
  const otherUser = getOtherUser();
  const canSendMessage = isRecruiter() 
    ? true 
    : (isCandidate() ? conversation.status === 'accepted' : false);
  const isUserLoaded = user && (user.id || user.email);

  // Fonction pour obtenir l'URL de l'image (logo ou photo)
  const getAvatarUrl = () => {
    if (!otherUser) return null;
    
    // Si c'est une entreprise (a un logo)
    if (otherUser.logo) {
      if (typeof otherUser.logo === 'string') {
        if (otherUser.logo.startsWith('http')) return otherUser.logo;
        const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        return `${mediaBaseUrl}${otherUser.logo}`;
      }
    }
    
    // Si c'est un candidat (a une photo de profil)
    if (otherUser.profile_picture) {
      if (typeof otherUser.profile_picture === 'string') {
        if (otherUser.profile_picture.startsWith('http')) return otherUser.profile_picture;
        const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        return `${mediaBaseUrl}${otherUser.profile_picture}`;
      }
    }
    
    return null;
  };

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    if (!otherUser) return 'U';
    
    // Pour une entreprise
    if (otherUser.name) {
      return otherUser.name[0].toUpperCase();
    }
    
    // Pour un candidat
    if (otherUser.first_name && otherUser.last_name) {
      return `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase();
    }
    
    if (otherUser.first_name) {
      return otherUser.first_name[0].toUpperCase();
    }
    
    if (otherUser.email) {
      return otherUser.email[0].toUpperCase();
    }
    
    return 'U';
  };

  const avatarUrl = getAvatarUrl();
  const initials = getInitials();

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-user-avatar">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={otherUser?.name || otherUser?.first_name || 'Avatar'} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span style={{ display: avatarUrl ? 'none' : 'flex' }}>
              {initials}
            </span>
          </div>
          <div className="chat-user-details">
            <h3>
              {otherUser?.name 
                ? otherUser.name 
                : (otherUser?.first_name && otherUser?.last_name 
                    ? `${otherUser.first_name} ${otherUser.last_name}`
                    : otherUser?.email || 'Utilisateur')}
            </h3>
            <span className="chat-status">
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>×</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Chargement des messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">Aucun message</div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender?.id && user?.id && message.sender.id === user.id;
            return (
              <div
                key={message.id}
                className={`chat-message ${isOwn ? 'own' : 'other'}`}
              >
                <div className="chat-message-content">
                  <p>{message.content}</p>
                  <span className="chat-message-time">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Indicateur de frappe */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="chat-typing-indicator">
            {(() => {
              // typingUsers contient maintenant les noms d'utilisateurs (ou emails en fallback)
              if (typingUsers.length === 1) {
                const typingName = typingUsers[0];
                return `${typingName} est en train d'écrire...`;
              }
              return `${typingUsers.length} personnes sont en train d'écrire...`;
            })()}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!canSendMessage && conversation?.status === 'pending' && (
        <div className="chat-warning">
          ⏳ En attente de l'acceptation du recruteur
        </div>
      )}
      
      {canSendMessage && isUserLoaded && (
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Rédiger un message..."
            value={newMessage}
            onChange={handleTyping}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!newMessage.trim()}
          >
            Envoyer
          </button>
        </form>
      )}
      
      {canSendMessage && !isUserLoaded && (
        <div className="chat-warning">
          Chargement de l'utilisateur...
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
