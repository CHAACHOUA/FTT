import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaClock, FaUser, FaEye, FaTrash, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from '../../../../components/loyout/Loading';
import '../../../../pages/styles/candidate/VirtualApplications.css';

const VirtualApplications = ({ forum, accessToken, apiBaseUrl }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    if (forum) {
      fetchApplications();
    }
  }, [forum]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${apiBaseUrl}/virtual/applications/`,
        {
          withCredentials: true,
          params: { forum_id: forum.id }
        }
      );
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des candidatures:', err);
      setError('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleCancelApplication = async (applicationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette candidature ?')) {
      try {
        await axios.delete(
          `${apiBaseUrl}/virtual/applications/${applicationId}/`,
          { withCredentials: true }
        );
        
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        toast.success('Candidature annulée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        toast.error('Erreur lors de l\'annulation de la candidature');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#ffc107', text: 'En attente', bg: '#fff3cd' },
      reviewed: { color: '#17a2b8', text: 'Consultée', bg: '#d1ecf1' },
      accepted: { color: '#28a745', text: 'Acceptée', bg: '#d4edda' },
      rejected: { color: '#dc3545', text: 'Refusée', bg: '#f8d7da' },
      cancelled: { color: '#6c757d', text: 'Annulée', bg: '#e2e3e5' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className="status-badge"
        style={{ 
          color: config.color, 
          backgroundColor: config.bg,
          border: `1px solid ${config.color}`
        }}
      >
        {config.text}
      </span>
    );
  };

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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Erreur</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={fetchApplications}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="virtual-applications">
      <div className="applications-header">
        <h2>Mes candidatures</h2>
        <p>Suivez l'état de vos candidatures pour le forum {forum.name}</p>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <FaFileAlt className="no-applications-icon" />
          <h3>Aucune candidature</h3>
          <p>Vous n'avez pas encore postulé à des offres pour ce forum.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="application-title">
                  <h3>{application.offer?.title}</h3>
                  <p className="company-name">{application.offer?.company?.name}</p>
                </div>
                <div className="application-status">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <FaFileAlt />
                  <span>Type: {application.offer?.contract_type}</span>
                </div>
                <div className="detail-item">
                  <FaUser />
                  <span>Secteur: {application.offer?.sector}</span>
                </div>
                {application.selected_slot && (
                  <div className="detail-item">
                    <FaClock />
                    <span>
                      {formatDate(application.selected_slot.start_time)} à {formatTime(application.selected_slot.start_time)}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <FaCalendar />
                  <span>Postulé le {formatDate(application.created_at)}</span>
                </div>
              </div>

              <div className="application-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewApplication(application)}
                >
                  <FaEye /> Voir les détails
                </button>
                {application.status === 'pending' && (
                  <button 
                    className="btn-danger"
                    onClick={() => handleCancelApplication(application.id)}
                  >
                    <FaTrash /> Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showApplicationModal && selectedApplication && (
        <div className="application-modal-overlay">
          <div className="application-modal">
            <div className="modal-header">
              <h3>Détails de la candidature</h3>
              <button 
                className="close-btn"
                onClick={() => setShowApplicationModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="application-info">
                <h4>{selectedApplication.offer?.title}</h4>
                <p><strong>Entreprise:</strong> {selectedApplication.offer?.company?.name}</p>
                <p><strong>Statut:</strong> {getStatusBadge(selectedApplication.status)}</p>
                
                {selectedApplication.selected_slot && (
                  <div className="slot-info">
                    <h5>Créneau sélectionné:</h5>
                    <p>
                      {formatDate(selectedApplication.selected_slot.start_time)} à {formatTime(selectedApplication.selected_slot.start_time)}
                    </p>
                  </div>
                )}
                
                {selectedApplication.questionnaire_responses && (
                  <div className="questionnaire-info">
                    <h5>Réponses au questionnaire:</h5>
                    <p>Vous avez répondu au questionnaire personnalisé de l'entreprise.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => setShowApplicationModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualApplications;
