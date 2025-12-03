import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaEnvelope, FaDownload, FaComments } from 'react-icons/fa';
import '../../../pages/styles/candidate/CandidateProfile.css';
import ChatService from '../../../services/ChatService';

import Presentation from '../../../components/card/candidate/profile_section/Presentation';
import Contact from '../../../components/card/candidate/profile_section/Contact';
import EducationProfile from '../../../components/card/candidate/public_profile/EducationProfile';
import ExperienceProfile from '../../../components/card/candidate/public_profile/ExperienceProfile';
import LanguageProfile from '../../../components/card/candidate/public_profile/LanguageProfile';
import { Button, Input, Card, Badge } from '../../../components/common';
import SkillProfile from '../../../components/card/candidate/public_profile/SkillProfile';

const CandidateProfile = ({ candidateData, onClose, forum = null }) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  useEffect(() => {
    // Animation d'entrée - pas besoin de timer
    setIsAnimating(false);
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleDownloadCV = () => {
    if (candidateData.cv_file) {
      const cvUrl = candidateData.cv_file.startsWith('http') 
        ? candidateData.cv_file 
        : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${candidateData.cv_file}`;
      window.open(cvUrl, '_blank');
    }
  };

  const handleContact = async () => {
    // Si c'est un forum virtuel, créer une conversation
    if (forum && (forum.type === 'virtuel' || forum.is_virtual)) {
      try {
        setIsContacting(true);
        
        // Récupérer l'ID du candidat (dans le modèle Candidate, user est la clé primaire)
        const candidateId = candidateData.user || candidateData.user_id || candidateData.id;
        
        if (!candidateId) {
          console.error('❌ [CandidateProfile] Structure candidateData:', candidateData);
          alert('ID du candidat introuvable');
          return;
        }

        console.log('📤 [CandidateProfile] Création conversation:', {
          forumId: forum.id,
          candidateId: candidateId
        });
        
        // Créer ou récupérer la conversation
        const conversation = await ChatService.createConversation(
          forum.id,
          null,
          candidateId
        );

        console.log('✅ [CandidateProfile] Conversation créée:', conversation);

        // Fermer le popup
        onClose();

        // Rediriger vers le dashboard recruteur avec le chat ouvert
        navigate('/event/recruiter/dashboard/', {
          state: {
            forum: forum,
            openChat: true,
            conversationId: conversation.id
          }
        });
      } catch (error) {
        console.error('❌ [CandidateProfile] Erreur lors de la création de la conversation:', error);
        console.error('❌ [CandidateProfile] Détails erreur:', error.response?.data);
        const errorMessage = error.response?.data?.error 
          || error.response?.data?.detail
          || (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : error.message)
          || 'Erreur lors de la création de la conversation';
        alert(errorMessage);
      } finally {
        setIsContacting(false);
      }
    } else {
      // Pour les forums non virtuels, utiliser l'email
      if (candidateData.email) {
        window.open(`mailto:${candidateData.email}`, '_blank');
      }
    }
  };

  const isVirtualForum = forum && (forum.type === 'virtuel' || forum.is_virtual);


  if (!candidateData) return null;

  return (
    <div className={`candidate-profile-overlay ${isAnimating ? 'animating' : ''}`} onClick={handleClose}>
      <div className={`candidate-profile-modal ${isAnimating ? 'animating' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Header simple avec boutons */}
        <div className="candidate-profile-header">
          <div className="candidate-header-actions">
            {candidateData.cv_file && (
              <button 
                className="action-btn download-btn"
                onClick={handleDownloadCV}
                title="Télécharger le CV"
              >
                <FaDownload />
              </button>
            )}
            <button className="close-button" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>
        </div>


        {/* Contenu des sections */}
        <div className="candidate-profile-content">
          <section className="profile-section">
            <Presentation formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <Contact formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <EducationProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <ExperienceProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <LanguageProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <SkillProfile formData={candidateData} readOnly />
          </section>
        </div>

        {/* Footer avec actions */}
        <div className="candidate-profile-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Fermer
          </button>
          {candidateData.cv_file && (
            <button 
              className="btn-secondary" 
              onClick={handleDownloadCV}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaDownload />
              Voir CV
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={handleContact}
            disabled={isContacting}
          >
            {isVirtualForum ? (
              <>
                <FaComments />
                {isContacting ? 'Création...' : 'Contacter'}
              </>
            ) : (
              <>
                <FaEnvelope />
                Contacter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
