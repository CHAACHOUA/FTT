import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  faCheck, 
  faTimes, 
  faClock, 
  faUser, 
  faCalendar,
  faBuilding,
  faEnvelope,
  faVideo,
  faPhone,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';
import Loading from '../../../../components/loyout/Loading';

const CandidateApplications = ({ forumId: propForumId }) => {
  const { forumId: paramForumId } = useParams();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer le forumId depuis les props, params ou depuis le state
  const currentForumId = propForumId || paramForumId || location.state?.forum?.id;

  useEffect(() => {
    if (currentForumId) {
      loadApplications();
    }
  }, [currentForumId]);

  const loadApplications = async () => {
    try {
      console.log('🔍 [CANDIDAT] Chargement des candidatures pour le forum:', currentForumId);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${currentForumId}/applications/candidate/`,
        { withCredentials: true }
      );
      
      console.log('✅ [CANDIDAT] Candidatures chargées:', response.data);
      setApplications(response.data);
    } catch (error) {
      console.error('❌ [CANDIDAT] Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: faClock, 
        text: 'En attente de validation',
        description: 'Votre candidature est en cours d\'examen'
      },
      accepted: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: faCheck, 
        text: 'Acceptée',
        description: 'Félicitations ! Votre candidature a été acceptée'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: faTimes, 
        text: 'Rejetée',
        description: 'Votre candidature n\'a pas été retenue'
      }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <div className={`status-badge ${badge.color}`}>
        <FontAwesomeIcon icon={badge.icon} className="status-icon" />
        {badge.text}
      </div>
    );
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: 'Votre candidature est en cours d\'examen par le recruteur.',
      accepted: 'Félicitations ! Votre candidature a été acceptée. Vous devriez recevoir un email de confirmation.',
      rejected: 'Votre candidature n\'a pas été retenue pour ce poste.'
    };
    
    return descriptions[status] || descriptions.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      video: faVideo,
      phone: faPhone,
      in_person: faUser
    };
    
    return icons[type] || faVideo;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatTime = (timeString) => {
    if (timeString && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return timeString;
  };


  if (loading) {
    return <Loading />;
  }

  return (
    <div className="offers-list-wrapper">
      <div className="offers-list-content">
        <div className="company-recruiters-header">
          <h2 className="company-recruiters-title">Mes candidatures ({applications.length} candidature{applications.length > 1 ? 's' : ''})</h2>
        </div>

        {/* Tableau des candidatures */}
        {applications.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faUser} className="empty-icon" />
            <h3 className="empty-title">Aucune candidature</h3>
            <p className="empty-description">
              Vous n'avez pas encore postulé à des offres.
            </p>
          </div>
        ) : (
          <div className="members-table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>ENTREPRISE</th>
                  <th>TITRE OFFRE</th>
                  <th>CRÉNEAU CHOISI</th>
                  <th>STATUT</th>
                  <th>DATE CANDIDATURE</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="recruiter-info">
                      <div className="recruiter-avatar">
                        {application.offer?.company?.logo ? (
                          <img 
                            src={application.offer.company.logo.startsWith('http') 
                              ? application.offer.company.logo 
                              : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${application.offer.company.logo}`} 
                            alt={application.offer?.company?.name || 'Entreprise'} 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="avatar-placeholder" 
                          style={{ display: application.offer?.company?.logo ? 'none' : 'flex' }}
                        >
                          {(application.offer?.company?.name || application.offer_company || 'E').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="recruiter-details">
                        <div className="recruiter-name">
                          {application.offer?.company?.name || application.offer_company || 'Entreprise non spécifiée'}
                        </div>
                      </div>
                    </td>
                    <td className="offer-title">
                      <div className="offer-title-text">
                        {application.offer?.title || application.offer_title || 'Titre non spécifié'}
                      </div>
                    </td>
                    <td className="slot-info">
                      {application.selected_slot_info ? (
                        <div className="slot-details">
                          <FontAwesomeIcon 
                            icon={getTypeIcon(application.selected_slot_info.type)} 
                            className="slot-icon" 
                          />
                          <div>
                            <div className="slot-date">
                              {formatDate(application.selected_slot_info.date)}
                            </div>
                            <div className="slot-time">
                              {formatTime(application.selected_slot_info.start_time)} - {formatTime(application.selected_slot_info.end_time)}
                            </div>
                            <div className="slot-type">
                              {(() => {
                                const type = application.selected_slot_info.type;
                                return type === 'video' ? 'Vidéo' : 
                                       type === 'phone' ? 'Téléphone' : type;
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="no-slot">-</span>
                      )}
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="date-added">
                      {formatDate(application.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bloc informatif */}
        <div className="members-info-block">
          <div className="info-card">
            <h3>Suivi des candidatures</h3>
            <p>Consultez ici l'état de toutes vos candidatures et les créneaux que vous avez sélectionnés.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplications;
