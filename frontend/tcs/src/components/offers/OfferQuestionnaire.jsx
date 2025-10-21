import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestion,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faCheck,
  faUsers,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import QuestionnaireBuilder from '../questionnaire/QuestionnaireBuilder';
import './OfferQuestionnaire.css';

const OfferQuestionnaire = ({ offer, onUpdate, accessToken, apiBaseUrl }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (offer?.questionnaire) {
      setQuestionnaire(offer.questionnaire);
      fetchStats();
    }
  }, [offer]);

  const fetchStats = async () => {
    if (!offer?.questionnaire?.id) return;
    
    try {
      const response = await axios.get(
        `${apiBaseUrl}/virtual/questionnaires/${offer.questionnaire.id}/stats/`,
        { withCredentials: true }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleCreateQuestionnaire = () => {
    setShowBuilder(true);
  };

  const handleEditQuestionnaire = () => {
    setShowBuilder(true);
  };

  const handleDeleteQuestionnaire = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce questionnaire ?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${apiBaseUrl}/virtual/questionnaires/${questionnaire.id}/`,
        { withCredentials: true }
      );
      
      setQuestionnaire(null);
      setStats(null);
      toast.success('Questionnaire supprimé avec succès');
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireSave = async (questionnaireData) => {
    try {
      setLoading(true);
      
      if (questionnaire) {
        // Mettre à jour le questionnaire existant
        const response = await axios.put(
          `${apiBaseUrl}/virtual/questionnaires/${questionnaire.id}/`,
          {
            ...questionnaireData,
            offer: offer.id
          },
          { withCredentials: true }
        );
        setQuestionnaire(response.data);
      } else {
        // Créer un nouveau questionnaire
        const response = await axios.post(
          `${apiBaseUrl}/virtual/questionnaires/`,
          {
            ...questionnaireData,
            offer: offer.id
          },
          { withCredentials: true }
        );
        setQuestionnaire(response.data);
      }
      
      setShowBuilder(false);
      toast.success('Questionnaire sauvegardé avec succès');
      onUpdate && onUpdate();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (showBuilder) {
    return (
      <div className="questionnaire-builder-container">
        <QuestionnaireBuilder
          offer={offer}
          questionnaire={questionnaire}
          onSave={handleQuestionnaireSave}
          onCancel={() => setShowBuilder(false)}
        />
      </div>
    );
  }

  return (
    <div className="offer-questionnaire">
      <div className="questionnaire-header">
        <h3>
          <FontAwesomeIcon icon={faQuestion} />
          Questionnaire de candidature
        </h3>
        <div className="questionnaire-actions">
          {questionnaire ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleEditQuestionnaire}
              >
                <FontAwesomeIcon icon={faEdit} />
                Modifier
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteQuestionnaire}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} />
                Supprimer
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleCreateQuestionnaire}
            >
              <FontAwesomeIcon icon={faPlus} />
              Créer un questionnaire
            </button>
          )}
        </div>
      </div>

      {questionnaire ? (
        <div className="questionnaire-content">
          <div className="questionnaire-info">
            <h4>{questionnaire.title}</h4>
            {questionnaire.description && (
              <p className="questionnaire-description">{questionnaire.description}</p>
            )}
            
            <div className="questionnaire-meta">
              <div className="meta-item">
                <FontAwesomeIcon icon={faQuestion} />
                <span>{questionnaire.questions_count} question(s)</span>
              </div>
              <div className="meta-item">
                <FontAwesomeIcon icon={faCheck} />
                <span>{questionnaire.is_required ? 'Obligatoire' : 'Optionnel'}</span>
              </div>
              <div className="meta-item">
                <FontAwesomeIcon icon={faCheck} />
                <span>{questionnaire.is_active ? 'Actif' : 'Inactif'}</span>
              </div>
            </div>
          </div>

          {stats && (
            <div className="questionnaire-stats">
              <h5>
                <FontAwesomeIcon icon={faChartBar} />
                Statistiques
              </h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.total_responses}</div>
                  <div className="stat-label">Réponses totales</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.completed_responses}</div>
                  <div className="stat-label">Réponses complètes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{Math.round(stats.completion_rate)}%</div>
                  <div className="stat-label">Taux de completion</div>
                </div>
              </div>
            </div>
          )}

          <div className="questionnaire-questions">
            <h5>Questions ({questionnaire.questions?.length || 0})</h5>
            {questionnaire.questions && questionnaire.questions.length > 0 ? (
              <div className="questions-list">
                {questionnaire.questions.map((question, index) => (
                  <div key={question.id} className="question-item">
                    <div className="question-number">{index + 1}</div>
                    <div className="question-content">
                      <div className="question-text">{question.question_text}</div>
                      <div className="question-meta">
                        <span className="question-type">{question.question_type}</span>
                        {question.is_required && (
                          <span className="required-badge">Obligatoire</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-questions">Aucune question définie</p>
            )}
          </div>
        </div>
      ) : (
        <div className="no-questionnaire">
          <FontAwesomeIcon icon={faQuestion} />
          <h4>Aucun questionnaire</h4>
          <p>Créez un questionnaire personnalisé pour cette offre</p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCreateQuestionnaire}
          >
            <FontAwesomeIcon icon={faPlus} />
            Créer un questionnaire
          </button>
        </div>
      )}
    </div>
  );
};

export default OfferQuestionnaire;
