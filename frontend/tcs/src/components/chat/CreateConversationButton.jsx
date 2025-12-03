import React, { useState } from 'react';
import ChatService from '../../services/ChatService';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../hooks/useUser';
import './CreateConversationButton.css';

const CreateConversationButton = ({ forumId, recruiterId, candidateId, onConversationCreated }) => {
  const { user } = useAuth();
  const { isRecruiter, isCandidate } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCreateConversation = async () => {
    try {
      setLoading(true);
      
      // Déterminer qui est le recruteur et qui est le candidat
      let recruiter = recruiterId;
      let candidate = candidateId;
      
      // Si l'utilisateur actuel est un recruteur, il est le recruteur
      if (isRecruiter()) {
        recruiter = user.id;
        candidate = candidateId;
      } else if (isCandidate()) {
        // Si l'utilisateur actuel est un candidat, il est le candidat
        recruiter = recruiterId;
        candidate = user.id;
      }
      
      const conversation = await ChatService.createConversation(forumId, recruiter, candidate);
      
      if (onConversationCreated) {
        onConversationCreated(conversation);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="create-conversation-btn"
      onClick={handleCreateConversation}
      disabled={loading}
      title={isCandidate() ? "Demander une discussion avec ce recruteur" : "Initiier une conversation avec ce candidat"}
    >
      {loading ? '...' : isCandidate() ? '💬 Demander une discussion' : '💬 Contacter'}
    </button>
  );
};

export default CreateConversationButton;

