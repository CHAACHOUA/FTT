import React, { useState, useEffect, useCallback } from 'react';
import ChatService from '../../services/ChatService';
import { useUser } from '../../hooks/useUser';
import useConversationListWebSocket from '../../hooks/useConversationListWebSocket';
import { FaChevronDown } from 'react-icons/fa';
import './ChatList.css';

const ChatList = ({ forumId, onSelectConversation, selectedConversationId, onShowCompanySearch }) => {
  const { isRecruiter, isCandidate } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(null); // null, pending, accepted, rejected

  const loadConversations = useCallback(async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      const data = await ChatService.getConversations(forumId);
      
      // Filtrer selon le statut UNIQUEMENT pour les recruteurs
      let filtered = data;
      if (isRecruiter()) {
        if (filter === 'pending') {
          filtered = data.filter(c => c.status === 'pending');
        } else if (filter === 'accepted') {
          filtered = data.filter(c => c.status === 'accepted');
        } else if (filter === 'rejected') {
          filtered = data.filter(c => c.status === 'rejected');
        }
      }
      
      setConversations(filtered);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [forumId, filter]); // Retirer isRecruiter des dépendances

  // WebSocket pour les mises à jour de la liste
  const handleConversationUpdated = useCallback((conversationId, conversationData) => {
    console.log('🔄 [ChatList] Mise à jour WebSocket:', conversationId, conversationData);
    
    if (conversationData) {
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conversationId);
        
        if (existingIndex >= 0) {
          // Mettre à jour la conversation existante
          const updated = [...prev];
          updated[existingIndex] = conversationData;
          
          // Appliquer le filtre si nécessaire
          let filtered = updated;
          if (isRecruiter()) {
            if (filter === 'pending') {
              filtered = updated.filter(c => c.status === 'pending');
            } else if (filter === 'accepted') {
              filtered = updated.filter(c => c.status === 'accepted');
            } else if (filter === 'rejected') {
              filtered = updated.filter(c => c.status === 'rejected');
            }
          }
          
          // Trier par date
          filtered.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.last_message?.created_at || 0);
            const dateB = new Date(b.updated_at || b.last_message?.created_at || 0);
            return dateB - dateA;
          });
          
          return filtered;
        } else {
          // Nouvelle conversation
          if (isRecruiter()) {
            if (filter === 'pending' && conversationData.status !== 'pending') {
              return prev; // Ne pas ajouter si ne correspond pas au filtre
            }
            if (filter === 'accepted' && conversationData.status !== 'accepted') {
              return prev; // Ne pas ajouter si ne correspond pas au filtre
            }
            if (filter === 'rejected' && conversationData.status !== 'rejected') {
              return prev; // Ne pas ajouter si ne correspond pas au filtre
            }
          }
          
          return [conversationData, ...prev].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.last_message?.created_at || 0);
            const dateB = new Date(b.updated_at || b.last_message?.created_at || 0);
            return dateB - dateA;
          });
        }
      });
    }
    // Ne plus utiliser de fallback HTTP - le WebSocket doit toujours fournir les données
  }, [isRecruiter, filter]);
  
  useConversationListWebSocket(handleConversationUpdated);

  // Charger uniquement au montage et quand le filtre change
  useEffect(() => {
    if (forumId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumId, filter]); // Ne pas inclure loadConversations pour éviter les re-renders infinis

  const handleAcceptRequest = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await ChatService.updateConversationStatus(conversationId, 'accepted');
      // Le WebSocket mettra à jour automatiquement la liste
      // Mettre à jour localement pour feedback immédiat
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === conversationId ? { ...c, status: 'accepted' } : c
        );
        // Si on filtre par 'pending', retirer la conversation acceptée
        if (isRecruiter() && filter === 'pending') {
          return updated.filter(c => c.status === 'pending');
        }
        return updated;
      });
      
      if (onSelectConversation) {
        const updated = conversations.find(c => c.id === conversationId);
        if (updated) {
          onSelectConversation({ ...updated, status: 'accepted' });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur lors de l\'acceptation de la demande');
    }
  };

  const handleRejectRequest = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await ChatService.updateConversationStatus(conversationId, 'rejected');
      // Le WebSocket mettra à jour automatiquement la liste
      // Retirer immédiatement de la liste si on filtre par 'pending'
      if (isRecruiter() && filter === 'pending') {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert('Erreur lors du refus de la demande');
    }
  };

  const getOtherUser = (conversation) => {
    if (isRecruiter()) {
      return conversation.candidate;
    }
    return conversation.company;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const renderConversationContent = (conversation, otherUser, isSelected, lastMessage) => {
    const getAvatarUrl = () => {
      if (!otherUser) return null;
      
      if (otherUser.logo) {
        if (typeof otherUser.logo === 'string') {
          if (otherUser.logo.startsWith('http')) return otherUser.logo;
          const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
          return `${mediaBaseUrl}${otherUser.logo}`;
        }
      }
      
      if (otherUser.profile_picture) {
        if (typeof otherUser.profile_picture === 'string') {
          if (otherUser.profile_picture.startsWith('http')) return otherUser.profile_picture;
          const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
          return `${mediaBaseUrl}${otherUser.profile_picture}`;
        }
      }
      
      return null;
    };

    const getInitials = () => {
      if (!otherUser) return 'U';
      
      if (otherUser.name) {
        return otherUser.name[0].toUpperCase();
      }
      
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
      <div
        key={conversation.id}
        className={`chat-conversation-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectConversation(conversation)}
      >
        <div className="conversation-avatar">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={otherUser?.name || otherUser?.first_name || 'Avatar'} 
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <span style={{ display: avatarUrl ? 'none' : 'flex' }}>
            {initials}
          </span>
        </div>
        <div className="conversation-info">
          <div className="conversation-header">
            <h4>
              {isRecruiter() 
                ? (otherUser?.first_name && otherUser?.last_name 
                    ? `${otherUser.first_name} ${otherUser.last_name}`
                    : otherUser?.email || 'Candidat')
                : (otherUser?.name || 'Entreprise')}
            </h4>
            <div className="conversation-header-badges">
              {conversation.status === 'pending' && (
                <span className="conversation-status-badge pending">
                  En attente
                </span>
              )}
              {conversation.unread_count > 0 && (
                <span className="conversation-unread-badge">
                  {conversation.unread_count}
                </span>
              )}
            </div>
          </div>
          <div className="conversation-preview">
            {lastMessage ? (
              <>
                <p className="conversation-last-message">
                  {lastMessage.content.length > 50
                    ? `${lastMessage.content.substring(0, 50)}...`
                    : lastMessage.content}
                </p>
                <span className="conversation-time">
                  {formatDate(lastMessage.created_at)}
                </span>
              </>
            ) : (
              <p className="conversation-no-message">Aucun message</p>
            )}
          </div>
          {conversation.status === 'pending' && isRecruiter() && (
            <div className="conversation-actions">
              <button
                className="btn-accept"
                onClick={(e) => handleAcceptRequest(conversation.id, e)}
              >
                Accepter
              </button>
              <button
                className="btn-reject"
                onClick={(e) => handleRejectRequest(conversation.id, e)}
              >
                Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Conversations</h2>
        <div className="chat-header-actions">
          {isCandidate() && onShowCompanySearch && (
            <button
              className="search-company-btn"
              onClick={() => onShowCompanySearch()}
              title="Rechercher une entreprise"
            >
              <span>+</span>
            </button>
          )}
          <div className="chat-status-indicator">
            <span className="status-dot"></span>
            <span>En ligne</span>
          </div>
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="chat-conversations">
        {isRecruiter() ? (
          <>
            {/* Filtre En attente */}
            <div className="chat-filter-section">
              <div
                className={`chat-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter(filter === 'pending' ? null : 'pending')}
              >
                <span>En attente</span>
                <FaChevronDown className={`chevron ${filter === 'pending' ? 'open' : ''}`} />
              </div>
              {filter === 'pending' && (
                <div className="chat-filter-conversations">
                  {loading ? (
                    <div className="chat-loading">Chargement...</div>
                  ) : conversations.length === 0 ? (
                    <div className="chat-empty">Aucune conversation en attente</div>
                  ) : (
                    conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const isSelected = selectedConversationId === conversation.id;
                      const lastMessage = conversation.last_message;
                      
                      return renderConversationContent(conversation, otherUser, isSelected, lastMessage);
                    })
                  )}
                </div>
              )}
            </div>

            {/* Filtre Accepté */}
            <div className="chat-filter-section">
              <div
                className={`chat-filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilter(filter === 'accepted' ? null : 'accepted')}
              >
                <span>Accepté</span>
                <FaChevronDown className={`chevron ${filter === 'accepted' ? 'open' : ''}`} />
              </div>
              {filter === 'accepted' && (
                <div className="chat-filter-conversations">
                  {loading ? (
                    <div className="chat-loading">Chargement...</div>
                  ) : conversations.length === 0 ? (
                    <div className="chat-empty">Aucune conversation acceptée</div>
                  ) : (
                    conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const isSelected = selectedConversationId === conversation.id;
                      const lastMessage = conversation.last_message;
                      
                      return renderConversationContent(conversation, otherUser, isSelected, lastMessage);
                    })
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {loading ? (
              <div className="chat-loading">Chargement...</div>
            ) : conversations.length === 0 ? (
              <div className="chat-empty">
                Aucune conversation. Cliquez sur le bouton + pour contacter une entreprise.
              </div>
            ) : (
              conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = selectedConversationId === conversation.id;
            const lastMessage = conversation.last_message;
            
            return (
              <div
                key={conversation.id}
                className={`chat-conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {(() => {
                    // Fonction pour obtenir l'URL de l'image
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
                      <>
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={otherUser?.name || otherUser?.first_name || 'Avatar'} 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <span style={{ display: avatarUrl ? 'none' : 'flex' }}>
                          {initials}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>
                      {isRecruiter() 
                        ? (otherUser?.first_name && otherUser?.last_name 
                            ? `${otherUser.first_name} ${otherUser.last_name}`
                            : otherUser?.email || 'Candidat')
                        : (otherUser?.name || 'Entreprise')}
                    </h4>
                    <div className="conversation-header-badges">
                      {conversation.status === 'pending' && (
                        <span className="conversation-status-badge pending">
                          En attente
                        </span>
                      )}
                      {conversation.unread_count > 0 && (
                        <span className="conversation-unread-badge">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="conversation-preview">
                    {lastMessage ? (
                      <>
                        <p className="conversation-last-message">
                          {lastMessage.content.length > 50
                            ? `${lastMessage.content.substring(0, 50)}...`
                            : lastMessage.content}
                        </p>
                        <span className="conversation-time">
                          {formatDate(lastMessage.created_at)}
                        </span>
                      </>
                    ) : (
                      <p className="conversation-no-message">Aucun message</p>
                    )}
                  </div>
                  {conversation.status === 'pending' && isRecruiter() && (
                    <div className="conversation-actions">
                      <button
                        className="btn-accept"
                        onClick={(e) => handleAcceptRequest(conversation.id, e)}
                      >
                        Accepter
                      </button>
                      <button
                        className="btn-reject"
                        onClick={(e) => handleRejectRequest(conversation.id, e)}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;
