import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import CompanySearch from './CompanySearch';
import ChatService from '../../services/ChatService';
import { useUser } from '../../hooks/useUser';
import './ChatContainer.css';

const ChatContainer = ({ forumId, initialConversationId = null }) => {
  const { isCandidate } = useUser();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showCompanySearch, setShowCompanySearch] = useState(false);

  // Ouvrir automatiquement la conversation si initialConversationId est fourni
  useEffect(() => {
    if (initialConversationId && !selectedConversation) {
      ChatService.getConversation(initialConversationId)
        .then(conversation => {
          setSelectedConversation(conversation);
          setShowCompanySearch(false);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération de la conversation:', error);
        });
    }
  }, [initialConversationId, selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowCompanySearch(false);
    // Ne plus utiliser refreshKey - le WebSocket gère les mises à jour
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  const handleConversationCreated = (conversation) => {
    setSelectedConversation(conversation);
    setShowCompanySearch(false);
    // Le WebSocket ajoutera automatiquement la nouvelle conversation à la liste
  };

  const handleConversationUpdate = () => {
    // Ne plus faire de requête HTTP - le WebSocket gère les mises à jour
    // Cette fonction est gardée pour compatibilité mais ne fait plus rien
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        {showCompanySearch && isCandidate() ? (
          <CompanySearch
            forumId={forumId}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <ChatList
            forumId={forumId}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            onShowCompanySearch={() => setShowCompanySearch(true)}
          />
        )}
      </div>
      <div className="chat-main">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={handleCloseChat}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : (
          <div className="chat-placeholder">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
