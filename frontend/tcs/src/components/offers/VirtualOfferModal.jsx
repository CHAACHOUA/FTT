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
import QuestionnaireBuilder from '../questionnaire/QuestionnaireBuilder';
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
    location: '',
    description: '',
    profile_recherche: '',
    status: 'draft',
    start_date: '',
    experience_required: '1-3',
  });
  const [questionnaire, setQuestionnaire] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (offer) {
        // Mode édition
        setOfferData({
          title: offer.title || '',
          contract_type: offer.contract_type || '',
          sector: offer.sector || '',
          location: offer.location || '',
          description: offer.description || '',
          profile_recherche: offer.profile_recherche || '',
          status: offer.status || 'draft',
          start_date: offer.start_date || '',
          experience_required: offer.experience_required || '1-3',
        });
        setQuestionnaire(offer.questionnaire || null);
      } else {
        // Mode création
        setOfferData({
          title: '',
          contract_type: '',
          sector: '',
          location: '',
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
    setQuestionnaire(questionnaireData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('apiBaseUrl:', apiBaseUrl);
      console.log('forum:', forum);
      console.log('offer:', offer);
      
      let savedOffer;
      
      if (offer) {
        // Mode édition
        console.log('Mode édition - Offre ID:', offer.id);
        console.log('URL:', `${apiBaseUrl}/recruiters/offers/${offer.id}/update/`);
        console.log('Data:', { ...offerData, forum_id: forum.id });
        
        const response = await axios.put(
          `${apiBaseUrl}/recruiters/offers/${offer.id}/update/`,
          {
            ...offerData,
            forum_id: forum.id
          },
          { withCredentials: true }
        );
        savedOffer = response.data;
      } else {
        // Mode création
        const response = await axios.post(
          `${apiBaseUrl}/recruiters/offers/create/`,
          {
            ...offerData,
            forum_id: forum.id
          },
          { withCredentials: true }
        );
        savedOffer = response.data;
      }
      
      // Sauvegarder le questionnaire si fourni
      if (questionnaire) {
        try {
          const questionnaireData = {
            ...questionnaire,
            offer: savedOffer.id
          };
          
          if (offer?.questionnaire) {
            // Mettre à jour le questionnaire existant
            await axios.put(
              `${apiBaseUrl}/virtual/questionnaires/${offer.questionnaire.id}/`,
              questionnaireData,
              { withCredentials: true }
            );
          } else {
            // Créer un nouveau questionnaire
            await axios.post(
              `${apiBaseUrl}/virtual/questionnaires/`,
              questionnaireData,
              { withCredentials: true }
            );
          }
        } catch (questionnaireError) {
          console.error('Erreur lors de la sauvegarde du questionnaire:', questionnaireError);
          toast.warning('Offre sauvegardée mais erreur avec le questionnaire');
        }
      }
      
      toast.success(offer ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
      onSave && onSave(savedOffer);
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
      <div className="step-header">
        <h3>
          <FontAwesomeIcon icon={faBriefcase} />
          Informations de l'offre
        </h3>
        <p>Renseignez les détails de votre offre d'emploi</p>
      </div>

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
          <select
            value={offerData.contract_type}
            onChange={(e) => handleInputChange('contract_type', e.target.value)}
            className={errors.contract_type ? 'error' : ''}
          >
            <option value="">Sélectionnez...</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
            <option value="Alternance">Alternance</option>
          </select>
          {errors.contract_type && <span className="error-message">{errors.contract_type}</span>}
        </div>

        <div className="form-group">
          <label>Secteur *</label>
          <select
            value={offerData.sector}
            onChange={(e) => handleInputChange('sector', e.target.value)}
            className={errors.sector ? 'error' : ''}
          >
            <option value="">Sélectionnez...</option>
            <option value="Informatique">Informatique</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="RH">Ressources Humaines</option>
            <option value="Commercial">Commercial</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.sector && <span className="error-message">{errors.sector}</span>}
        </div>

        <div className="form-group">
          <label>Localisation</label>
          <input
            type="text"
            value={offerData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Paris, Remote, etc."
          />
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
      <div className="step-header">
        <h3>
          <FontAwesomeIcon icon={faQuestion} />
          Questions de candidature
        </h3>
        <p>Ajoutez des questions personnalisées pour cette offre (optionnel)</p>
      </div>

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
