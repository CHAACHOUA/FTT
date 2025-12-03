import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaClock, FaUser, FaFileAlt, FaTimes, FaDownload } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import Modal from '../../../../components/card/common/Modal';
import VirtualQuestionnaireForm from '../../../../components/application/VirtualQuestionnaireForm';
import VirtualSlotSelection from '../../../../components/application/VirtualSlotSelection';
import VirtualApplicationConfirmation from '../../../../components/application/VirtualApplicationConfirmation';
import { Button, Badge, Card, Input } from '../../../../components/common';
import '../../../../pages/styles/candidate/VirtualApplicationPage.css';
import '../../../../components/offers/VirtualOfferModal.css';

const CandidateApplicationPage = ({ isModal = false, onClose = null, offer: propOffer = null, forum: propForum = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { offer: stateOffer, forum: stateForum } = location.state || {};
  
  // Utiliser les props si disponibles, sinon utiliser le state
  const offer = propOffer || stateOffer;
  const forum = propForum || stateForum;
  
  
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    offer: null,
    questionnaire: null,
    slot: null,
    status: 'pending'
  });
  const questionnaireRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const steps = [
    { id: 1, title: 'Questions', icon: FaUser, description: 'Questions personnalisées' },
    { id: 2, title: 'Créneau', icon: FaClock, description: 'Sélection du créneau' }
  ];

  useEffect(() => {
    if (offer && forum) {
      console.log('🔍 CandidateApplicationPage - Loading with offer:', offer);
      setApplicationData(prev => ({ ...prev, offer }));
      loadQuestionnaire();
      loadAvailableSlots();
    } else if (!isModal) {
      // Rediriger si pas d'offre ou forum (seulement si pas en modal)
      navigate('/forums/event');
    }
  }, [offer, forum, navigate, isModal]);


  const loadQuestionnaire = async () => {
    try {
      console.log('🔍 Loading questionnaire for offer:', offer.id);
      console.log('🔍 Offer details:', offer);
      console.log('🔍 Forum details:', forum);
      console.log('🔍 API URL:', `${process.env.REACT_APP_API_BASE_URL}/virtual/offers/${offer.id}/questionnaire/`);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/offers/${offer.id}/questionnaire/`,
        { withCredentials: true }
      );
      console.log('✅ Questionnaire loaded:', response.data);
      console.log('✅ Questionnaire questions:', response.data.questions);
      console.log('✅ Questions count:', response.data.questions?.length);
      console.log('✅ Full response:', JSON.stringify(response.data, null, 2));
      setQuestionnaire(response.data);
    } catch (error) {
      console.log('❌ Error loading questionnaire:', error);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error message:', error.response?.data);
      console.log('❌ Error config:', error.config);
      
      // Seulement mettre à null si c'est vraiment une 404 (pas de questionnaire)
      if (error.response?.status === 404) {
        console.log('ℹ️ Aucun questionnaire pour cette offre (404)');
        setQuestionnaire(null);
      } else if (error.response?.status === 403) {
        console.log('❌ Accès refusé (403) - Vérifier les permissions');
        setQuestionnaire(null);
      } else {
        console.log('❌ Erreur lors du chargement du questionnaire');
        setQuestionnaire(null);
      }
    }
  };

  const loadAvailableSlots = async () => {
    try {
      console.log('🔍 [CANDIDAT] Loading ALL slots for forum:', forum.id);
      console.log('🔍 [CANDIDAT] API URL:', `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forum.id}/agenda/`);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${forum.id}/agenda/`,
        { withCredentials: true }
      );
      
      console.log('✅ [CANDIDAT] All slots loaded:', response.data);
      console.log('📊 [CANDIDAT] Nombre de slots reçus:', response.data.length);
      
      if (response.data.length > 0) {
        console.log('📊 [CANDIDAT] Premier slot:', response.data[0]);
      }
      
      // Récupérer seulement les créneaux disponibles (status = 'available') et futurs
      const availableSlots = response.data.filter(slot => {
        const slotDate = new Date(slot.date + 'T' + slot.start_time);
        const now = new Date();
        const isFuture = slotDate > now;
        const isAvailable = slot.status === 'available';
        
        console.log('🔍 [CANDIDAT] Slot:', slot.date, slot.start_time, 'Status:', slot.status, 'Futur?', isFuture, 'Disponible?', isAvailable);
        
        return isFuture && isAvailable;
      });
      
      console.log('✅ [CANDIDAT] Available slots filtered:', availableSlots);
      console.log('📊 [CANDIDAT] Nombre de slots disponibles:', availableSlots.length);
      setAvailableSlots(availableSlots);
    } catch (error) {
      console.error('❌ [CANDIDAT] Erreur lors du chargement des créneaux:', error);
      if (error.response) {
        console.error('📊 [CANDIDAT] Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      setAvailableSlots([]);
    }
  };

  const handleNext = async () => {
    // Collecter automatiquement les données avant de passer à l'étape suivante
    if (currentStep === 1 && questionnaire) {
      console.log('🔍 [CANDIDAT] handleNext called on step 1 - collecting questionnaire data');
      
      // Essayer de récupérer les réponses depuis le composant questionnaire
      let questionnaireData = { questionnaire_id: questionnaire.id, answers: [] };
      
      if (questionnaireRef.current && questionnaireRef.current.getAnswers) {
        const answers = questionnaireRef.current.getAnswers();
        console.log('🔍 [CANDIDAT] Retrieved answers from questionnaire component:', answers);
        
        if (answers && Object.keys(answers).length > 0) {
          // Convertir les réponses en format attendu
          questionnaireData.answers = await Promise.all(Object.entries(answers).filter(([questionId, answer]) => {
            return answer !== null && answer !== undefined && answer !== '' && 
                   !(Array.isArray(answer) && answer.length === 0);
          }).map(async ([questionId, answer]) => {
            const question = questionnaire.questions.find(q => q.id == questionId);
            
            let answerFile = null;
            if (answer instanceof File) {
              // Convertir le fichier en base64
              try {
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(answer);
                });
                answerFile = {
                  name: answer.name,
                  size: answer.size,
                  type: answer.type,
                  data: base64
                };
                console.log(`🔍 [CANDIDAT] File converted to base64:`, answerFile);
              } catch (error) {
                console.error('Erreur lors de la conversion du fichier:', error);
              }
            }
            
            return {
              question: questionId,
              question_text: question?.question_text || '',
              question_type: question?.question_type || '',
              answer_text: typeof answer === 'string' ? answer : null,
              answer_number: typeof answer === 'number' ? answer : null,
              answer_choices: Array.isArray(answer) ? answer : null,
              answer_file: answerFile
            };
          }));
        }
      }
      
      console.log('🔍 [CANDIDAT] Final questionnaire data:', questionnaireData);
      setApplicationData(prev => ({ ...prev, questionnaire: questionnaireData }));
    }
    
    if (currentStep === 2 && availableSlots && availableSlots.length > 0) {
      // Étape slot - prendre le premier slot disponible
      setApplicationData(prev => ({ 
        ...prev, 
        slot: availableSlots[0] 
      }));
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Plus d'auto-avancement nécessaire

  const handleQuestionnaireSubmit = (questionnaireData) => {
    console.log('🔍 [CANDIDAT] handleQuestionnaireSubmit called with:', questionnaireData);
    setApplicationData(prev => {
      const newData = { ...prev, questionnaire: questionnaireData };
      console.log('🔍 [CANDIDAT] Updated applicationData:', newData);
      return newData;
    });
    handleNext();
  };

  const handleSlotSelect = (slot) => {
    console.log('🔍 [CANDIDAT] Slot selected:', slot);
    setApplicationData(prev => {
      const newData = { ...prev, slot };
      console.log('🔍 [CANDIDAT] Updated applicationData with slot:', newData);
      return newData;
    });
    // Ne pas passer automatiquement à l'étape suivante - l'utilisateur doit cliquer sur "Candidater"
  };

  const handleApplicationSubmit = async (e) => {
    // Empêcher le comportement par défaut et la propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setLoading(true);
      
      // S'assurer que les données sont collectées même si pas dans applicationData
      let questionnaireData = applicationData.questionnaire;
      let slotData = applicationData.slot;
      
      console.log('🔍 [CANDIDAT] Current applicationData:', applicationData);
      console.log('🔍 [CANDIDAT] questionnaireData from state:', questionnaireData);
      console.log('🔍 [CANDIDAT] slotData from state:', slotData);
      
      // Si pas de données questionnaire mais questionnaire existe, créer une structure vide
      if (!questionnaireData && questionnaire) {
        questionnaireData = { questionnaire_id: questionnaire.id, answers: [] };
        console.log('🔍 [CANDIDAT] Created empty questionnaire data:', questionnaireData);
      }
      
      // Ne pas prendre automatiquement le premier slot - l'utilisateur doit sélectionner
      // if (!slotData && availableSlots && availableSlots.length > 0) {
      //   slotData = availableSlots[0];
      //   console.log('🔍 [CANDIDAT] Selected first available slot:', slotData);
      // }
      
      const applicationPayload = {
        offer: offer.id,
        forum: forum.id,
        selected_slot: slotData?.id || null,
        status: 'pending'
      };
      
      if (questionnaireData) {
        applicationPayload.questionnaire_responses = questionnaireData;
      }
      
      console.log('🚀 [FRONTEND] Payload final:', applicationPayload);
      console.log('🚀 [FRONTEND] Questionnaire data:', questionnaireData);
      console.log('🚀 [FRONTEND] Slot data:', slotData);
      console.log('🚀 [FRONTEND] Selected slot ID:', slotData?.id);
      
      const applicationResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/`,
        applicationPayload,
        { withCredentials: true }
      );
      
      console.log('✅ [FRONTEND] Response from backend:', applicationResponse.data);
      toast.success('Candidature envoyée avec succès !');
      
      if (isModal && onClose) {
        // Si c'est un modal, fermer le modal
        onClose();
      } else {
        // Sinon, naviguer vers la page
        navigate('/forums/event', { 
          state: { 
            forum, 
            activeTab: 'candidatures',
            showSuccess: true 
          } 
        });
      }
      
    } catch (error) {
      console.error('❌ [FRONTEND] Erreur lors de la candidature:', error);
      console.error('❌ [FRONTEND] Error response:', error.response?.data);
      console.error('❌ [FRONTEND] Error status:', error.response?.status);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Erreur lors de la soumission de la candidature';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VirtualQuestionnaireForm
            ref={questionnaireRef}
            questionnaire={questionnaire}
            onSubmit={handleQuestionnaireSubmit}
            onSkip={() => {
              // Collecter les réponses même si on skip
              console.log('🔍 [CANDIDAT] onSkip called - collecting questionnaire data');
              if (questionnaire) {
                // Créer une structure avec les réponses vides mais valide
                const questionnaireData = { 
                  questionnaire_id: questionnaire.id, 
                  answers: [] 
                };
                console.log('🔍 [CANDIDAT] Skipping with empty answers:', questionnaireData);
                handleQuestionnaireSubmit(questionnaireData);
              } else {
                handleNext();
              }
            }}
            hideActions={true}
          />
        );

      case 2:
        return (
          <VirtualSlotSelection
            slots={availableSlots}
            offer={offer}
            onSelect={handleSlotSelect}
            onSkip={() => {
              // Même si on skip, on collecte les données existantes
              if (availableSlots && availableSlots.length > 0) {
                // Prendre le premier slot disponible
                handleSlotSelect(availableSlots[0]);
              } else {
                handleNext();
              }
            }}
            hideActions={true}
          />
        );

      default:
        return <div>Erreur: étape inconnue</div>;
    }
  };

  if (!offer || !forum) {
    if (isModal) {
      // En mode modal, afficher un message d'erreur
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="application-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Erreur</h2>
              <button onClick={onClose}>✕</button>
            </div>
            <div className="application-modal-content">
              <p>Informations d'offre manquantes.</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="virtual-application-page">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>Informations d'offre manquantes. Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className={isModal ? "application-modal-content" : "virtual-application-page"}>
      {/* Header avec navigation */}
      <div className="application-header">
        {isModal ? (
          <div className="modal-header">
            <h2 className="modal-title">Candidature - {offer.title}</h2>
            <p className="modal-subtitle">Étape {currentStep}/3</p>
            <button className="modal-close" onClick={onClose} title="Fermer" aria-label="Fermer la fenêtre">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <>
            <button 
              className="back-button"
              onClick={() => navigate('/forums/event', { state: { forum, activeTab: 'offres' } })}
            >
              <FaArrowLeft /> Retour aux offres
            </button>
            
            <div className="application-title">
              <h1>Candidature - {offer.title}</h1>
              <p>Étape {currentStep}/3</p>
            </div>
          </>
        )}
      </div>

      {/* Étapes visuelles - MÊME DESIGN que ForumRegistrationPopup */}
      <div className="modal-steps">
        <div className={`modal-step ${currentStep >= 1 ? (currentStep === 1 ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}>
          <div className="modal-step-number">1</div>
          <span>Questions</span>
        </div>
        <div className={`modal-step ${currentStep >= 2 ? (currentStep === 2 ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}>
          <div className="modal-step-number">2</div>
          <span>Créneau</span>
        </div>
      </div>

      {/* Contenu principal - UNIFIÉ avec ForumRegistrationPopup */}
      <div className="modal-body">
        {renderStepContent()}
      </div>

      {/* Navigation supprimée du contenu principal - maintenant dans la structure du modal */}
    </div>
  );

  // Si c'est un modal, utiliser la même structure que VirtualOfferModal
  if (isModal) {
    return (
      <div className="virtual-offer-modal-overlay" onClick={onClose}>
        <div className="virtual-offer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              <h2>Candidature</h2>
              <span className="step-indicator">Étape {currentStep}/{steps.length}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="step-navigation">
            <div className={`step-tab ${currentStep === 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Questions</div>
            </div>
            <div className={`step-tab ${currentStep === 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Créneau</div>
            </div>
          </div>

          <div className="modal-body">
            {renderStepContent()}
          </div>

          <div className="modal-footer">
            <div className="footer-left">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevious}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Précédent
                </button>
              )}
            </div>
            <div className="footer-right" style={{ position: 'relative', zIndex: 1000 }}>
              {currentStep === steps.length ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplicationSubmit(e);
                  }}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Envoi...' : 'Candidater'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="btn-primary"
                >
                  Suivant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sinon, retourner le contenu normal
  return content;
};

export default CandidateApplicationPage;

