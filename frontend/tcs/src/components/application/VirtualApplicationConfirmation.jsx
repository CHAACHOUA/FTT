import React from 'react';
import { FaCheck, FaFileAlt, FaUser, FaClock, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VirtualApplicationConfirmation.css';

const VirtualApplicationConfirmation = ({ 
  applicationData, 
  onSubmit, 
  loading,
  hideActions = false
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlotDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return diffMinutes;
  };

  return (
    <div className="confirmation-step">
      <div className="confirmation-header">
        <FaCheck className="confirmation-icon" />
        <h3>Confirmation de candidature</h3>
        <p>Vérifiez les informations avant d'envoyer votre candidature</p>
      </div>

      <div className="confirmation-content">
        <div className="confirmation-section">
          <h4><FaFileAlt /> Informations de l'offre</h4>
          <div className="info-grid">
            <div className="info-item">
              <strong>Poste :</strong>
              <span>{applicationData.offer?.title}</span>
            </div>
            <div className="info-item">
              <strong>Entreprise :</strong>
              <span>{applicationData.offer?.company?.name}</span>
            </div>
            <div className="info-item">
              <strong>Type de contrat :</strong>
              <span>{applicationData.offer?.contract_type}</span>
            </div>
            <div className="info-item">
              <strong>Secteur :</strong>
              <span>{applicationData.offer?.sector}</span>
            </div>
            <div className="info-item">
              <strong>Localisation :</strong>
              <span>{applicationData.offer?.location}</span>
            </div>
          </div>
        </div>

        {applicationData.questionnaire && (
          <div className="confirmation-section">
            <h4><FaUser /> Questionnaire</h4>
            <div className="questionnaire-summary">
              <p>Vous avez répondu au questionnaire personnalisé de l'entreprise.</p>
              <div className="answers-count">
                {Object.keys(applicationData.questionnaire).length} réponses
              </div>
            </div>
          </div>
        )}

        {applicationData.slot && (
          <div className="confirmation-section">
            <h4><FaClock /> Créneau sélectionné</h4>
            <div className="slot-summary">
              <div className="slot-date">
                <FaCalendar />
                {formatDate(applicationData.slot.start_time)}
              </div>
              <div className="slot-time">
                <FaClock />
                {formatTime(applicationData.slot.start_time)} - {formatTime(applicationData.slot.end_time)}
                <span className="slot-duration">
                  ({getSlotDuration(applicationData.slot.start_time, applicationData.slot.end_time)} min)
                </span>
              </div>
              {applicationData.slot.recruiter && (
                <div className="slot-recruiter">
                  <FaUser />
                  {applicationData.slot.recruiter.first_name} {applicationData.slot.last_name}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="confirmation-section">
          <h4>Statut de candidature</h4>
          <div className="status-info">
            <div className="status-badge pending">
              <FaCheck />
              En attente de traitement
            </div>
            <p>Votre candidature sera transmise au recruteur qui pourra la consulter et vous contacter.</p>
          </div>
        </div>
      </div>

      {!hideActions && (
        <div className="confirmation-actions">
          <button 
            className="btn-primary submit-btn" 
            onClick={onSubmit}
            disabled={loading}
          >
            <FaCheck />
            {loading ? 'Envoi en cours...' : 'Envoyer la candidature'}
          </button>
        </div>
      )}

      <div className="confirmation-note">
        <p>
          <strong>Note :</strong> Une fois envoyée, votre candidature sera visible 
          dans votre espace "Mes candidatures" et transmise au recruteur.
        </p>
      </div>
    </div>
  );
};

export default VirtualApplicationConfirmation;
