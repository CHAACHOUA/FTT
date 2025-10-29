import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { FaArrowLeft, FaArrowRight, FaCheck, FaClock, FaUser, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import Modal from '../card/common/Modal';
import VirtualQuestionnaireForm from './VirtualQuestionnaireForm';
import VirtualSlotSelection from './VirtualSlotSelection';
import VirtualApplicationConfirmation from './VirtualApplicationConfirmation';
import './VirtualApplicationFlow.css';

const VirtualApplicationFlow = ({ 
  isOpen, 
  onClose, 
  offer, 
  forum, 
  accessToken, 
  apiBaseUrl 
}) => {
  const [currentStep, setCurrentStep] = useState(1); // Commencer aux questions
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
    console.log('🔍 VirtualApplicationFlow - useEffect triggered:', { isOpen, offer, forum, apiBaseUrl });
    if (isOpen && offer) {
      console.log('🔍 VirtualApplicationFlow - Opening with offer:', offer);
      setApplicationData(prev => ({ ...prev, offer }));
      loadQuestionnaire();
      loadAvailableSlots();
    } else if (!isOpen) {
      // Réinitialiser l'état quand le modal se ferme
      console.log('🔍 VirtualApplicationFlow - Modal closed, resetting state');
      setCurrentStep(1);
      setApplicationData({
        offer: null,
        questionnaire: null,
        slot: null,
        status: 'pending'
      });
      setQuestionnaire(null);
      setAvailableSlots([]);
    }
  }, [isOpen, offer, forum, apiBaseUrl]);

  const loadQuestionnaire = async () => {
    try {
      console.log('🔍 Loading questionnaire for offer:', offer.id);
      const response = await axios.get(
        `${apiBaseUrl}/virtual/offers/${offer.id}/questionnaire/`,
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
      console.log('🔍 Loading all recruiter slots for forum:', forum.id);
      const response = await axios.get(
        `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/`,
        { withCredentials: true }
      );
      console.log('✅ All slots loaded:', response.data);
      
      // Récupérer tous les créneaux de tous les recruteurs (disponibles et réservés)
      const allSlots = response.data.filter(slot => 
        new Date(slot.start_time) > new Date() // Seulement les créneaux futurs
      );
      
      // Grouper les créneaux par heure pour afficher tous les créneaux disponibles
      const groupedSlots = {};
      allSlots.forEach(slot => {
        const timeKey = slot.start_time;
        if (!groupedSlots[timeKey]) {
          groupedSlots[timeKey] = [];
        }
        groupedSlots[timeKey].push(slot);
      });
      
      console.log('✅ Grouped slots by time:', groupedSlots);
      setAvailableSlots(allSlots);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des créneaux:', error);
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
      
      // Créer la candidature
      const applicationResponse = await axios.post(
        `${apiBaseUrl}/virtual/applications/`,
        {
          offer: offer.id,
          forum: forum.id,
          questionnaire_responses: applicationData.questionnaire,
          selected_slot: applicationData.slot?.id,
          status: 'pending'
        },
        { withCredentials: true }
      );

      // Réserver le créneau si sélectionné
      if (applicationData.slot) {
        await axios.post(
          `${apiBaseUrl}/virtual/forums/${forum.id}/agenda/${applicationData.slot.id}/book/`,
          { withCredentials: true }
        );
      }

      toast.success('Candidature envoyée avec succès !');
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la candidature:', error);
      toast.error('Erreur lors de l\'envoi de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = handleApplicationSubmit;

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

  if (!isOpen) return null;

  console.log('🔍 VirtualApplicationFlow - Rendering modal with:', { isOpen, offer, forum, currentStep });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidature - ${offer?.title || 'Offre'}`}
      subtitle={`Étape ${currentStep}/3`}
      size="large"
    >
      <div className="modal-steps">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`modal-step ${currentStep >= step.id ? (currentStep === step.id ? 'modal-step-active' : 'modal-step-completed') : 'modal-step-pending'}`}
          >
            <div className="modal-step-number">{step.id}</div>
            <span>{step.title}</span>
          </div>
        ))}
      </div>

      <div className="modal-form">
        {renderStepContent()}
      </div>

      <div className="modal-actions">
        {currentStep > 1 && (
          <button 
            type="button"
            className="modal-btn modal-btn-secondary" 
            onClick={handlePrevious}
            disabled={loading}
          >
            <FaArrowLeft /> Précédent
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button 
            type="button"
            className="modal-btn modal-btn-primary" 
            onClick={handleNext}
            disabled={loading}
          >
            Suivant <FaArrowRight />
          </button>
        ) : (
          <button 
            type="button"
            className="modal-btn modal-btn-success" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Terminer la candidature'}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default VirtualApplicationFlow;
