import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaClock, FaUser, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import VirtualQuestionnaireForm from '../../../../components/application/VirtualQuestionnaireForm';
import VirtualSlotSelection from '../../../../components/application/VirtualSlotSelection';
import VirtualApplicationConfirmation from '../../../../components/application/VirtualApplicationConfirmation';
import '../../../../pages/styles/candidate/VirtualApplicationPage.css';

const CandidateApplicationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { offer, forum } = location.state || {};
  
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    offer: null,
    questionnaire: null,
    slot: null,
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const steps = [
    { id: 1, title: 'Questions', icon: FaUser, description: 'Questions personnalisées' },
    { id: 2, title: 'Créneau', icon: FaClock, description: 'Sélection du créneau' },
    { id: 3, title: 'Confirmation', icon: FaCheck, description: 'Validation de candidature' }
  ];

  useEffect(() => {
    if (offer && forum) {
      console.log('🔍 CandidateApplicationPage - Loading with offer:', offer);
      setApplicationData(prev => ({ ...prev, offer }));
      loadQuestionnaire();
      loadAvailableSlots();
    } else {
      // Rediriger si pas d'offre ou forum
      navigate('/forums/event');
    }
  }, [offer, forum, navigate]);

  const loadQuestionnaire = async () => {
    try {
      console.log('🔍 Loading questionnaire for offer:', offer.id);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/offers/${offer.id}/questionnaire/`,
        { withCredentials: true }
      );
      console.log('✅ Questionnaire loaded:', response.data);
      setQuestionnaire(response.data);
    } catch (error) {
      console.log('ℹ️ Aucun questionnaire pour cette offre:', error.message);
      setQuestionnaire(null);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      console.log('🔍 [CANDIDAT] Loading all recruiter slots for forum:', forum.id);
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

  const handleNext = () => {
    console.log('🔍 Next button clicked, current step:', currentStep);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    console.log('🔍 Previous button clicked, current step:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuestionnaireSubmit = (questionnaireData) => {
    setApplicationData(prev => ({ ...prev, questionnaire: questionnaireData }));
    handleNext();
  };

  const handleSlotSelect = (slot) => {
    setApplicationData(prev => ({ ...prev, slot }));
    handleNext();
  };

  const handleApplicationSubmit = async () => {
    try {
      setLoading(true);
      
      const applicationPayload = {
        offer: offer.id,
        forum: forum.id,
        selected_slot: applicationData.slot?.id,
        status: 'pending'
      };
      
      // Ajouter questionnaire_responses seulement s'il existe
      if (applicationData.questionnaire) {
        applicationPayload.questionnaire_responses = applicationData.questionnaire;
      }
      
      console.log('🔍 [CANDIDAT] Soumission de candidature:');
      console.log('📊 [CANDIDAT] Payload:', applicationPayload);
      console.log('📊 [CANDIDAT] Offer:', offer);
      console.log('📊 [CANDIDAT] Forum:', forum);
      console.log('📊 [CANDIDAT] Questionnaire:', applicationData.questionnaire);
      console.log('📊 [CANDIDAT] Slot:', applicationData.slot);
      
      // Créer la candidature
      const applicationResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/`,
        applicationPayload,
        { withCredentials: true }
      );

      // CORRECTION: Ne pas réserver le slot automatiquement
      // Le slot sera réservé seulement quand le recruteur validera la candidature
      console.log('🔍 [CANDIDAT] Candidature créée en statut "pending" - slot non réservé');

      toast.success('Candidature envoyée avec succès !');
      navigate('/forums/event', { 
        state: { 
          forum, 
          activeTab: 'candidatures',
          showSuccess: true 
        } 
      });
      
    } catch (error) {
      console.error('❌ [CANDIDAT] Erreur lors de la soumission:', error);
      if (error.response) {
        console.error('📊 [CANDIDAT] Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        console.error('📊 [CANDIDAT] Headers:', error.response.headers);
        console.error('📊 [CANDIDAT] URL:', error.config?.url);
        console.error('📊 [CANDIDAT] Méthode:', error.config?.method);
        console.error('📊 [CANDIDAT] Données envoyées:', error.config?.data);
      }
      toast.error('Erreur lors de la soumission de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    console.log('🔍 Rendering step content for step:', currentStep);
    
    switch (currentStep) {
      case 1:
        return (
          <VirtualQuestionnaireForm
            questionnaire={questionnaire}
            onSubmit={handleQuestionnaireSubmit}
            onSkip={() => handleNext()}
          />
        );

      case 2:
        return (
          <VirtualSlotSelection
            slots={availableSlots}
            onSelect={handleSlotSelect}
            onSkip={() => handleNext()}
          />
        );

      case 3:
        return (
          <VirtualApplicationConfirmation
            applicationData={applicationData}
            onSubmit={handleApplicationSubmit}
            loading={loading}
          />
        );

      default:
        console.log('❌ Unknown step:', currentStep);
        return <div>Erreur: étape inconnue</div>;
    }
  };

  if (!offer || !forum) {
    return (
      <div className="virtual-application-page">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>Informations d'offre manquantes. Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="virtual-application-page">
      {/* Header avec navigation */}
      <div className="application-header">
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
      </div>

      {/* Indicateur d'étapes */}
      <div className="application-steps">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`step ${currentStep >= step.id ? (currentStep === step.id ? 'active' : 'completed') : 'pending'}`}
          >
            <div className="step-icon">
              <step.icon />
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="application-content">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="application-navigation">
        {currentStep > 1 && (
          <button 
            className="nav-button secondary" 
            onClick={handlePrevious}
            disabled={loading}
          >
            <FaArrowLeft /> Précédent
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button 
            className="nav-button primary" 
            onClick={handleNext}
            disabled={loading}
          >
            Suivant
          </button>
        ) : (
          <button 
            className="nav-button success" 
            onClick={handleApplicationSubmit}
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Terminer la candidature'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateApplicationPage;

