import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faArrowLeft,
  faArrowRight,
  faSave,
  faBriefcase,
  faQuestion,
  faBuilding,
  faMapMarkerAlt,
  faCalendar,
  faEuro,
  faUsers,
  faFileAlt,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import QuestionnaireBuilder from '../questionnaire/QuestionnaireBuilder';
import { getSectorsForSelect, getContractsForSelect, getRegionsForSelect } from '../../constants/choices';
import { Button, Badge, Card, Input } from '../common';
import './VirtualOfferModal.css';

const VirtualOfferModal = ({ 
  isOpen, 
  onClose, 
  offer = null, 
  forum, 
  onSave,
  accessToken,
  apiBaseUrl 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [offerData, setOfferData] = useState({
    title: '',
    contract_type: '',
    sector: '',
    region: '',
    description: '',
    profile_recherche: '',
    status: 'draft',
    start_date: '',
    experience_required: '1-3',
  });
  const [questionnaire, setQuestionnaire] = useState(null);
  const [errors, setErrors] = useState({});
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [choicesLoading, setChoicesLoading] = useState(true);

  // Charger les choix depuis l'API
  useEffect(() => {
    const loadChoices = async () => {
      try {
        setChoicesLoading(true);
        const [sectorsData, contractsData, regionsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect(),
          getRegionsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
        setRegions(regionsData);
        console.log('Régions chargées:', regionsData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
        toast.error('Erreur lors du chargement des options');
      } finally {
        setChoicesLoading(false);
      }
    };

    if (isOpen) {
      loadChoices();
    }
  }, [isOpen]);

  // Gérer l'effet de flou sur la navbar et le body
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const body = document.body;
    
    if (isOpen) {
      if (navbar) {
        navbar.classList.add('modal-open');
      }
      body.classList.add('modal-open');
    } else {
      if (navbar) {
        navbar.classList.remove('modal-open');
      }
      body.classList.remove('modal-open');
    }

    // Cleanup
    return () => {
      if (navbar) {
        navbar.classList.remove('modal-open');
      }
      body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (offer) {
        // Mode édition
        setOfferData({
          title: offer.title || '',
          contract_type: offer.contract_type || '',
          sector: offer.sector || '',
          region: offer.location || offer.region || '', // Mapper location du backend vers region du frontend
          description: offer.description || '',
          profile_recherche: offer.profile_recherche || '',
          status: offer.status || 'draft',
          start_date: offer.start_date || '',
          experience_required: offer.experience_required || '1-3',
        });
        console.log('Mode édition - Région initialisée:', offer.location || offer.region);
        console.log('Mode édition - offer.location:', offer.location);
        console.log('Mode édition - offer.region:', offer.region);
        // Charger le questionnaire existant
        if (offer.questionnaire) {
          console.log('Questionnaire existant chargé:', offer.questionnaire);
          setQuestionnaire(offer.questionnaire);
        } else {
          console.log('Aucun questionnaire existant');
          setQuestionnaire(null);
        }
        
        // Log après un délai pour voir l'état final
        setTimeout(() => {
          console.log('État offerData après initialisation:', offerData);
          console.log('Région dans offerData après initialisation:', offerData.region);
        }, 100);
      } else {
        // Mode création
        setOfferData({
          title: '',
          contract_type: '',
          sector: '',
          region: '',
          description: '',
          profile_recherche: '',
          status: 'draft',
          start_date: '',
          experience_required: '1-3',
        });
        setQuestionnaire(null);
      }
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, offer]);

  const handleInputChange = (field, value) => {
    setOfferData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    console.log(`Changement de ${field}:`, value);
    handleInputChange(field, value);
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!offerData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (!offerData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }
    
    if (!offerData.contract_type) {
      newErrors.contract_type = 'Le type de contrat est obligatoire';
    }
    
    if (!offerData.sector) {
      newErrors.sector = 'Le secteur est obligatoire';
    }
    
    if (!offerData.region) {
      newErrors.region = 'La région est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleQuestionnaireSave = (questionnaireData) => {
    console.log('Questionnaire sauvegardé:', questionnaireData);
    setQuestionnaire(questionnaireData);
  };

  // Fonction pour récupérer les questions du QuestionnaireBuilder
  const getQuestionnaireData = () => {
    console.log('=== GET QUESTIONNAIRE DATA ===');
    console.log('window.questionnaireBuilderData:', window.questionnaireBuilderData);
    console.log('questionnaire state local:', questionnaire);
    
    // Essayer de récupérer les données du QuestionnaireBuilder
    if (window.questionnaireBuilderData) {
      console.log('Données récupérées du QuestionnaireBuilder:', window.questionnaireBuilderData);
      console.log('Questions dans les données du builder:', window.questionnaireBuilderData.questions);
      console.log('Nombre de questions dans le builder:', window.questionnaireBuilderData.questions?.length || 0);
      
      // Vérifier que c'est bien un objet questionnaire et pas un objet offer
      if (window.questionnaireBuilderData.questions !== undefined) {
        console.log('=== FIN GET QUESTIONNAIRE DATA (builder) ===');
        return window.questionnaireBuilderData;
      } else {
        console.log('window.questionnaireBuilderData ne contient pas de questions, utilisation du state local');
      }
    }
    
    // Fallback vers le state local
    console.log('Utilisation du state local:', questionnaire);
    console.log('Questions dans le state local:', questionnaire?.questions);
    console.log('Nombre de questions dans le state local:', questionnaire?.questions?.length || 0);
    console.log('=== FIN GET QUESTIONNAIRE DATA (local) ===');
    return questionnaire;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('apiBaseUrl:', apiBaseUrl);
      console.log('forum:', forum);
      console.log('offer:', offer);
      console.log('offerData avant sauvegarde:', offerData);
      console.log('Région dans offerData:', offerData.region);
      
      let savedOffer;
      
      if (offer) {
        // Mode édition
        console.log('Mode édition - Offre ID:', offer.id);
        console.log('URL:', `${apiBaseUrl}/recruiters/offers/${offer.id}/update/`);
        const dataToSend = {
          ...offerData,
          location: offerData.region, // Mapper region vers location pour le backend
          forum_id: forum.id
        };
        // Supprimer region des données envoyées car on utilise location
        delete dataToSend.region;
        
        // Ajouter le questionnaire si disponible
        console.log('=== DEBUG QUESTIONNAIRE ===');
        console.log('window.questionnaireBuilderData:', window.questionnaireBuilderData);
        console.log('questionnaire state:', questionnaire);
        
        const questionnaireData = getQuestionnaireData();
        console.log('questionnaireData récupéré:', questionnaireData);
        
        if (questionnaireData) {
          dataToSend.questionnaire = questionnaireData;
          console.log('Questionnaire envoyé:', questionnaireData);
          console.log('Questions dans le questionnaire:', questionnaireData.questions);
          console.log('Nombre de questions:', questionnaireData.questions?.length || 0);
        } else {
          console.log('Aucun questionnaire à envoyer');
        }
        
        console.log('Data envoyée:', dataToSend);
        console.log('Location (région) dans les données:', dataToSend.location);
        console.log('Questionnaire inclus:', !!dataToSend.questionnaire);
        
        const response = await axios.put(
          `${apiBaseUrl}/recruiters/offers/${offer.id}/update/`,
          dataToSend,
          { withCredentials: true }
        );
        savedOffer = response.data;
      } else {
        // Mode création
        const dataToSend = {
          ...offerData,
          location: offerData.region, // Mapper region vers location pour le backend
          forum_id: forum.id
        };
        // Supprimer region des données envoyées car on utilise location
        delete dataToSend.region;
        
        // Ajouter le questionnaire si disponible
        const questionnaireData = getQuestionnaireData();
        if (questionnaireData) {
          dataToSend.questionnaire = questionnaireData;
          console.log('Questionnaire envoyé (création):', questionnaireData);
          console.log('Questions dans le questionnaire:', questionnaireData.questions);
          console.log('Nombre de questions:', questionnaireData.questions?.length || 0);
        } else {
          console.log('Aucun questionnaire à envoyer (création)');
        }
        
        console.log('Mode création - Data envoyée:', dataToSend);
        console.log('Location (région) dans les données:', dataToSend.location);
        console.log('Questionnaire inclus:', !!dataToSend.questionnaire);
        
        const response = await axios.post(
          `${apiBaseUrl}/recruiters/offers/create/`,
          dataToSend,
          { withCredentials: true }
        );
        savedOffer = response.data;
      }
      
      console.log('Offre sauvegardée avec succès:', savedOffer);
      
      // Recharger les données de l'offre pour avoir les questions mises à jour
      if (offer && savedOffer) {
        try {
          const offerResponse = await axios.get(
            `${apiBaseUrl}/recruiters/offers/${savedOffer.id}/`,
            { withCredentials: true }
          );
          const offerWithUpdatedQuestionnaire = offerResponse.data;
          console.log('Offre rechargée avec questionnaire mis à jour:', offerWithUpdatedQuestionnaire);
          console.log('Questions dans l\'offre rechargée:', offerWithUpdatedQuestionnaire.questionnaire?.questions);
          console.log('Nombre de questions dans l\'offre rechargée:', offerWithUpdatedQuestionnaire.questionnaire?.questions?.length || 0);
          
          toast.success(offer ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
          onSave && onSave(offerWithUpdatedQuestionnaire);
        } catch (error) {
          console.error('Erreur lors du rechargement de l\'offre:', error);
          toast.success(offer ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
          onSave && onSave(savedOffer);
        }
      } else {
        toast.success(offer ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
        onSave && onSave(savedOffer);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 404) {
        toast.error('Offre non trouvée. Vérifiez que l\'offre existe.');
      } else if (error.response?.status === 403) {
        toast.error('Vous n\'avez pas les permissions pour modifier cette offre.');
      } else {
        toast.error('Erreur lors de la sauvegarde de l\'offre');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Titre du poste *</label>
          <input
            type="text"
            value={offerData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Développeur Full Stack React/Node.js"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Type de contrat *</label>
          <Select
            value={contracts.find(option => option.value === offerData.contract_type) || null}
            onChange={(selectedOption) => handleSelectChange('contract_type', selectedOption)}
            options={contracts}
            placeholder="Sélectionnez..."
            isClearable
            isLoading={choicesLoading}
            className={errors.contract_type ? 'error' : ''}
            classNamePrefix="react-select"
          />
          {errors.contract_type && <span className="error-message">{errors.contract_type}</span>}
        </div>

        <div className="form-group">
          <label>Secteur *</label>
          <Select
            value={sectors.find(option => option.value === offerData.sector) || null}
            onChange={(selectedOption) => handleSelectChange('sector', selectedOption)}
            options={sectors}
            placeholder="Sélectionnez..."
            isClearable
            isLoading={choicesLoading}
            className={errors.sector ? 'error' : ''}
            classNamePrefix="react-select"
          />
          {errors.sector && <span className="error-message">{errors.sector}</span>}
        </div>

        <div className="form-group">
          <label>Région *</label>
          <Select
            value={regions.find(option => option.value === offerData.region) || null}
            onChange={(selectedOption) => handleSelectChange('region', selectedOption)}
            options={regions}
            placeholder="Sélectionnez..."
            isClearable
            isLoading={choicesLoading}
            className={errors.region ? 'error' : ''}
            classNamePrefix="react-select"
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
          />
          {errors.region && <span className="error-message">{errors.region}</span>}
          {/* Debug: Afficher la valeur actuelle */}
          {console.log('Debug région - offerData.region:', offerData.region)}
          {console.log('Debug région - regions disponibles:', regions)}
          {console.log('Debug région - valeur trouvée:', regions.find(option => option.value === offerData.region))}
        </div>


        <div className="form-group full-width">
          <label>Description du poste *</label>
          <textarea
            value={offerData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Décrivez les missions, responsabilités et objectifs du poste..."
            rows="6"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group full-width">
          <label>Profil recherché</label>
          <textarea
            value={offerData.profile_recherche}
            onChange={(e) => handleInputChange('profile_recherche', e.target.value)}
            placeholder="Compétences, expérience, qualités recherchées..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select
            value={offerData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="closed">Fermé</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date de début</label>
          <input
            type="date"
            value={offerData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Expérience requise</label>
          <select
            value={offerData.experience_required}
            onChange={(e) => handleInputChange('experience_required', e.target.value)}
          >
            <option value="0-1">0-1 an</option>
            <option value="1-3">1-3 ans</option>
            <option value="3-5">3-5 ans</option>
            <option value="5+">5+ ans</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="questionnaire-section">
        <QuestionnaireBuilder
          offer={offer}
          questionnaire={questionnaire}
          onSave={handleQuestionnaireSave}
          onCancel={() => setQuestionnaire(null)}
          apiBaseUrl={apiBaseUrl}
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="virtual-offer-modal-overlay">
      <div className="virtual-offer-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h2>
              {offer ? 'Modifier l\'offre' : 'Nouvelle offre'}
            </h2>
            <span className="step-indicator">Étape {currentStep}/2</span>
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
            <div className="step-label">Informations</div>
          </div>
          <div className={`step-tab ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Questions</div>
          </div>
        </div>

        <div className="modal-body">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            {currentStep === 2 && (
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
          
          <div className="footer-right">
            {currentStep === 1 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
              >
                Suivant
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <FontAwesomeIcon icon={loading ? faCheck : faSave} />
                {loading ? 'Sauvegarde...' : (offer ? 'Modifier' : 'Créer l\'offre')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualOfferModal;
