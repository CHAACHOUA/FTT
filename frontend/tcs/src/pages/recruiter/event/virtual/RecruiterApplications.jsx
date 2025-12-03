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
  faPhone,
  faVideo,
  faQuestion,
  faFileText,
  faEllipsisV,
  faBookmark,
  faEye,
  faMapMarkerAlt,
  faBriefcase,
  faIndustry,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Card, Badge } from '../../../../components/common';
import CandidateProfile from '../../../../pages/candidate/profile/CandidateProfile';
import '../common/CandidateListRecruiter.css';
import './RecruiterApplications.css';
import Loading from '../../../../components/loyout/Loading';

const RecruiterApplications = ({ forumId: propForumId }) => {
  const { forumId: paramForumId } = useParams();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, confirmed, waiting, rejected
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Récupérer le forumId depuis les props, params ou depuis le state
  const currentForumId = propForumId || paramForumId || location.state?.forum?.id;

  useEffect(() => {
    if (currentForumId) {
      loadApplications();
    }
  }, [currentForumId]);

  // Écouter les mises à jour de slots depuis d'autres composants
  useEffect(() => {
    const handleSlotUpdate = (event) => {
      console.log('🔄 [CANDIDATURES] Slot mis à jour:', event.detail);
      // Recharger les candidatures pour refléter les changements
      loadApplications();
    };

    window.addEventListener('slotUpdated', handleSlotUpdate);
    
    return () => {
      window.removeEventListener('slotUpdated', handleSlotUpdate);
    };
  }, []);

  const loadApplications = async () => {
    try {
      console.log('🔍 [RECRUTEUR] Chargement des candidatures pour le forum:', currentForumId);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/forums/${currentForumId}/applications/recruiter/`,
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidatures chargées:', response.data);
      console.log('🔍 [RECRUTEUR] Détail première candidature:', response.data[0]);
      if (response.data[0]) {
        console.log('🔍 [RECRUTEUR] Offer data:', response.data[0].offer);
        console.log('🔍 [RECRUTEUR] Status:', response.data[0].status);
        console.log('🔍 [RECRUTEUR] Candidate photo:', response.data[0].candidate_photo);
        console.log('🔍 [RECRUTEUR] Candidate data:', response.data[0].candidate);
        console.log('🔍 [RECRUTEUR] Questionnaire responses:', response.data[0].questionnaire_responses);
        console.log('🔍 [RECRUTEUR] Questionnaire responses type:', typeof response.data[0].questionnaire_responses);
        console.log('🔍 [RECRUTEUR] Questionnaire responses keys:', response.data[0].questionnaire_responses ? Object.keys(response.data[0].questionnaire_responses) : 'null/undefined');
        if (response.data[0].questionnaire_responses && response.data[0].questionnaire_responses.answers) {
          console.log('🔍 [RECRUTEUR] Answers array:', response.data[0].questionnaire_responses.answers);
          console.log('🔍 [RECRUTEUR] Answers length:', response.data[0].questionnaire_responses.answers.length);
        }
      }
      setApplications(response.data);
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateApplication = async (applicationId) => {
    try {
      console.log('🔍 [RECRUTEUR] Validation de la candidature:', applicationId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/${applicationId}/validate/`,
        {},
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidature validée:', response.data);
      toast.success('Candidature validée avec succès');
      
      // Recharger les candidatures
      loadApplications();
      
      // Déclencher un événement pour rafraîchir le calendrier
      window.dispatchEvent(new CustomEvent('slotUpdated', { 
        detail: { 
          action: 'validated', 
          applicationId,
          slotId: response.data.selected_slot 
        } 
      }));
      
      // Sauvegarder dans localStorage pour communication entre onglets
      localStorage.setItem('slotUpdate', JSON.stringify({
        action: 'validated',
        applicationId,
        slotId: response.data.selected_slot,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors de la validation:', error);
      if (error.response) {
        console.error('📊 [RECRUTEUR] Détails de l\'erreur:', error.response.data);
        toast.error(error.response.data.detail || 'Erreur lors de la validation');
      } else {
        toast.error('Erreur lors de la validation');
      }
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      console.log('🔍 [RECRUTEUR] Rejet de la candidature:', applicationId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/virtual/applications/${applicationId}/reject/`,
        {},
        { withCredentials: true }
      );
      
      console.log('✅ [RECRUTEUR] Candidature rejetée:', response.data);
      toast.success('Candidature rejetée');
      
      // Recharger les candidatures
      loadApplications();
      
      // Déclencher un événement pour rafraîchir le calendrier
      window.dispatchEvent(new CustomEvent('slotUpdated', { 
        detail: { 
          action: 'rejected', 
          applicationId,
          slotId: response.data.selected_slot 
        } 
      }));
      
      // Sauvegarder dans localStorage pour communication entre onglets
      localStorage.setItem('slotUpdate', JSON.stringify({
        action: 'rejected',
        applicationId,
        slotId: response.data.selected_slot,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ [RECRUTEUR] Erreur lors du rejet:', error);
      if (error.response) {
        console.error('📊 [RECRUTEUR] Détails de l\'erreur:', error.response.data);
        toast.error(error.response.data.detail || 'Erreur lors du rejet');
      } else {
        toast.error('Erreur lors du rejet');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusTexts = {
      pending: 'En Attente',
      accepted: 'Acceptée',
      rejected: 'Rejetée',
      confirmed: 'Confirmée',
      waiting: 'Attente retour'
    };
    
    return (
      <Badge type="status" variant={status}>
        {statusTexts[status] || statusTexts.pending}
      </Badge>
    );
  };

  const getCandidateInitials = (application) => {
    if (!application) return '?';
    // Utiliser le nom complet de l'application
    const candidateName = application.candidate_name || application.candidate_email || '';
    if (candidateName) {
      const names = candidateName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return candidateName.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getCandidatePhoto = (application) => {
    // Utiliser directement le champ candidate_photo du serializer
    if (application?.candidate_photo) {
      return `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${application.candidate_photo}`;
    }
    // Fallback sur l'ancien système
    if (application?.candidate?.profile_picture) {
      return `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${application.candidate.profile_picture}`;
    }
    return null;
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'pending':
        return applications.filter(app => app.status === 'pending' || app.status === 'reviewed').length;
      case 'confirmed':
        return applications.filter(app => app.status === 'accepted').length;
      case 'waiting':
        return applications.filter(app => app.status === 'waiting').length;
      case 'rejected':
        return applications.filter(app => app.status === 'rejected').length;
      default:
        return 0;
    }
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
      // Si c'est déjà un objet Date
      if (dateString instanceof Date) {
        return dateString.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // Si c'est une chaîne
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
      console.error('Erreur formatage date:', error, dateString);
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

  const filteredApplications = applications.filter(app => {
    // Filtrage par onglet actif
    let statusMatch = false;
    switch (activeTab) {
      case 'pending':
        // Afficher les candidatures en attente ou consultées (pas encore acceptées/rejetées)
        statusMatch = app.status === 'pending' || app.status === 'reviewed';
        break;
      case 'confirmed':
        statusMatch = app.status === 'accepted';
        break;
      case 'waiting':
        statusMatch = app.status === 'waiting';
        break;
      case 'rejected':
        statusMatch = app.status === 'rejected';
        break;
      default:
        statusMatch = true;
    }
    
    // Filtrage par terme de recherche
    const searchMatch = !searchTerm || 
      (app.candidate_name && app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.candidate_email && app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.offer?.title && app.offer.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.offer?.company?.name && app.offer.company.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });


  return (
    <div className="applications-container">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Titre */}
          <div className="applications-title-section">
            <h2 className="applications-title">Liste des candidatures ({applications.length} candidature{applications.length > 1 ? 's' : ''})</h2>
          </div>
          
          {/* Header avec onglets */}
          <div className="applications-header">
        <div className="header-tabs">
          <button
            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Nouveau - à traiter ({getTabCount('pending')})
          </button>
          <button
            className={`tab-button ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmés ({getTabCount('confirmed')})
          </button>
          <button
            className={`tab-button ${activeTab === 'waiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            Attente retour candidat ({getTabCount('waiting')})
          </button>
          <button
            className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Refusé ({getTabCount('rejected')})
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="search-section">
          <div className="search-bar">
            <FontAwesomeIcon icon={faUser} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par mots-clé"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Contenu principal - Layout Indeed */}
      <div className="applications-layout">
        {/* Colonne gauche - Liste des candidats */}
        <div className="candidates-column">
      {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faUser} className="empty-icon" />
              <h3>Aucune candidature</h3>
              <p>
                {activeTab === 'pending' 
                  ? 'Aucune nouvelle candidature à traiter.' 
                  : `Aucune candidature ${activeTab === 'confirmed' ? 'confirmée' : activeTab === 'waiting' ? 'en attente de retour' : 'refusée'}.`
            }
          </p>
        </div>
      ) : (
            <div className="candidates-list">
          {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className={`recruiter-candidate-card ${selectedApplication?.id === application.id ? 'selected' : ''}`}
                  onClick={() => setSelectedApplication(application)}
                >
                  {/* Avatar du candidat */}
                  <div className="recruiter-candidate-avatar">
                    {getCandidatePhoto(application) ? (
                      <img 
                        src={getCandidatePhoto(application)} 
                        alt={application.candidate_name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="recruiter-candidate-initials"
                      style={{ display: getCandidatePhoto(application) ? 'none' : 'flex' }}
                    >
                      {getCandidateInitials(application)}
                    </div>
                  </div>

                  {/* Informations du candidat */}
                  <div className="recruiter-candidate-info">
                    <h3 className="recruiter-candidate-name">
                      {application.candidate_name || application.candidate_email || 'Candidat'}
                    </h3>
                    <div className="recruiter-candidate-status">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                
                  {/* Actions */}
                  <div className="recruiter-candidate-actions">
                {application.status === 'pending' && (
                      <>
                    <button
                          className="recruiter-action-button reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectApplication(application.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button
                          className="recruiter-action-button accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValidateApplication(application.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      </>
                    )}
                    <button className="recruiter-action-button more">
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                )}
              </div>

        {/* Colonne droite - Détails de la candidature */}
        <div className="details-column">
          {selectedApplication ? (
            <div className="application-details">
              {/* Informations du candidat */}
              <div className="candidate-section">
                <h3 className="section-title">Informations du candidat</h3>
                <div className="candidate-card-detail-wrapper">
                  <div className="candidate-photo">
                    {getCandidatePhoto(selectedApplication) ? (
                      <img 
                        src={getCandidatePhoto(selectedApplication)} 
                        alt={selectedApplication.candidate_name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="default-avatar"
                      style={{ display: getCandidatePhoto(selectedApplication) ? 'none' : 'flex' }}
                    >
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  </div>
                  
                  <div className="candidate-info">
                    <div className="candidate-name-row">
                      <h3 className="candidate-full-name">
                        {selectedApplication.candidate_name || selectedApplication.candidate_email}
                      </h3>
                      {selectedApplication.candidate?.cv_file && (
                        <a
                          className="cv-download-inline"
                          href={
                            selectedApplication.candidate.cv_file.startsWith('http')
                              ? selectedApplication.candidate.cv_file
                              : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${selectedApplication.candidate.cv_file}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Télécharger le CV"
                        >
                          <FontAwesomeIcon icon={faFileText} />
                        </a>
                      )}
                      <button 
                        className="primary-action-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedApplication) {
                            const candidateProfile = selectedApplication.candidate_profile || {};
                            const candidateData = {
                              ...candidateProfile,
                              id: candidateProfile.id || selectedApplication.candidate?.id || selectedApplication.candidate,
                              first_name: candidateProfile.first_name || selectedApplication.candidate_name?.split(' ')[0] || 'Candidat',
                              last_name: candidateProfile.last_name || selectedApplication.candidate_name?.split(' ').slice(1).join(' ') || '',
                              email: candidateProfile.email || selectedApplication.candidate_email,
                              profile_picture: candidateProfile.profile_picture || selectedApplication.candidate_photo || selectedApplication.candidate?.profile_picture,
                              cv_file: candidateProfile.cv_file || selectedApplication.candidate?.cv_file,
                              search: candidateProfile.search || {},
                              phone: candidateProfile.phone || selectedApplication.candidate?.phone,
                              birth_date: candidateProfile.birth_date || selectedApplication.candidate?.birth_date,
                              address: candidateProfile.address || selectedApplication.candidate?.address,
                              city: candidateProfile.city || selectedApplication.candidate?.city,
                              postal_code: candidateProfile.postal_code || selectedApplication.candidate?.postal_code,
                              country: candidateProfile.country || selectedApplication.candidate?.country,
                              linkedin: candidateProfile.linkedin || selectedApplication.candidate?.linkedin,
                              github: candidateProfile.github || selectedApplication.candidate?.github,
                              portfolio: candidateProfile.portfolio || selectedApplication.candidate?.portfolio,
                              bio: candidateProfile.bio || selectedApplication.candidate?.bio,
                              educations: candidateProfile.educations || selectedApplication.candidate?.educations || [],
                              experiences: candidateProfile.experiences || selectedApplication.candidate?.experiences || [],
                              candidate_languages: candidateProfile.candidate_languages || selectedApplication.candidate?.candidate_languages || [],
                              skills: candidateProfile.skills || selectedApplication.candidate?.skills || [],
                            };
                            setSelectedCandidate(candidateData);
                            setShowCandidateProfile(true);
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Voir le profil
                      </button>
                    </div>

                    <div className="candidate-email-row">
                      <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
                      {selectedApplication.candidate_email}
                    </div>

                    <div className="sectors-container">
                      {(selectedApplication.candidate_profile?.search?.sector?.length ?? 0) > 0
                        ? selectedApplication.candidate_profile.search.sector.map((sector, i) => (
                            <Badge key={i} type="sector">{sector}</Badge>
                          ))
                        : (selectedApplication.candidate?.search?.sector?.length ?? 0) > 0
                        ? selectedApplication.candidate.search.sector.map((sector, i) => (
                            <Badge key={i} type="sector">{sector}</Badge>
                          ))
                        : <Badge type="sector" variant="empty">Non renseigné</Badge>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations sur l'offre */}
              <div className="offer-section">
                <h3 className="section-title">Informations sur l'offre</h3>
                <div className="offer-info">
                  <div className="offer-details">
                    <div className="offer-title">
                      {selectedApplication.offer?.title || selectedApplication.offer_title || 'Titre non spécifié'}
                    </div>
                    <div className="offer-company">
                      {selectedApplication.offer?.company?.name || selectedApplication.offer_company || 'Entreprise non spécifiée'}
                    </div>
                    <div className="offer-tags">
                      {selectedApplication.offer?.location && (
                        <div className="offer-tag">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="tag-icon" />
                          {selectedApplication.offer.location}
                        </div>
                      )}
                      {selectedApplication.offer?.contract_type && (
                        <div className="offer-tag">
                          <FontAwesomeIcon icon={faBriefcase} className="tag-icon" />
                          Type : {selectedApplication.offer.contract_type}
                        </div>
                      )}
                      {selectedApplication.offer?.sector && (
                        <div className="offer-tag">
                          <FontAwesomeIcon icon={faIndustry} className="tag-icon" />
                          Secteur : {selectedApplication.offer.sector}
                        </div>
                      )}
                      {selectedApplication.offer?.start_date && (
                        <div className="offer-tag">
                          <FontAwesomeIcon icon={faCalendarAlt} className="tag-icon" />
                          Début : {formatDate(selectedApplication.offer.start_date)}
                        </div>
                      )}
                    </div>
                    {selectedApplication.offer?.description && (
                      <div className="offer-description">
                        {selectedApplication.offer.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Créneau sélectionné */}
              {selectedApplication.selected_slot_info && (
                <div className="slot-section">
                  <div className="slot-header">
                    <div className="slot-header-icon">
                      <FontAwesomeIcon icon={faCalendar} />
                    </div>
                    <h3 className="slot-title">Créneau d'entretien</h3>
                  </div>
                  <div className="slot-info-grid">
                    <div className="slot-info-panel date-panel">
                      <div className="panel-icon date-icon-bg">
                        <FontAwesomeIcon icon={faCalendar} />
                      </div>
                      <div className="panel-content">
                        <div className="panel-label">Date</div>
                        <div className="panel-value">{formatDate(selectedApplication.selected_slot_info.date)}</div>
                      </div>
                    </div>
                    <div className="slot-info-panel time-panel">
                      <div className="panel-icon time-icon-bg">
                        <FontAwesomeIcon icon={faClock} />
                      </div>
                      <div className="panel-content">
                        <div className="panel-label">Horaire</div>
                        <div className="panel-value">
                          {formatTime(selectedApplication.selected_slot_info.start_time)} - {formatTime(selectedApplication.selected_slot_info.end_time)}
                        </div>
                      </div>
                    </div>
                    <div className="slot-info-panel type-panel">
                      <div className="panel-icon type-icon-bg">
                        <FontAwesomeIcon icon={getTypeIcon(selectedApplication.selected_slot_info.type)} />
                      </div>
                      <div className="panel-content">
                        <div className="panel-label">Type</div>
                        <div className="panel-value">
                          {selectedApplication.selected_slot_info.type === 'video' ? 'Visioconférence' : 
                           selectedApplication.selected_slot_info.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedApplication.selected_slot_info.description && (
                    <div className="slot-description">
                      <FontAwesomeIcon icon={faFileText} className="detail-icon" />
                      {selectedApplication.selected_slot_info.description}
                    </div>
                  )}
                </div>
              )}

              {/* Réponses au questionnaire */}
              {selectedApplication.questionnaire_responses && selectedApplication.questionnaire_responses.answers && (
                <div className="questionnaire-section">
                  <div className="questionnaire-header">
                    <div className="questionnaire-header-icon">
                      <FontAwesomeIcon icon={faQuestion} />
                    </div>
                    <h3 className="questionnaire-title">Réponses au questionnaire</h3>
                  </div>
                  <div className="questionnaire-info">
                    <div className="responses-list">
                      {selectedApplication.questionnaire_responses.answers.map((answer, index) => (
                        <div key={index} className="response-item">
                          <div className="question-badge">{index + 1}</div>
                          <div className="response-content">
                            <div className="response-question">
                              {answer.question_text || `Question ${index + 1}`}
                            </div>
                            <div className="response-answer-bubble">
                              {answer.answer_text && (
                                <div className="answer-text">
                                  {answer.answer_text}
                                </div>
                              )}
                              {answer.answer_number !== null && answer.answer_number !== undefined && (
                                <div className="answer-number">
                                  {answer.answer_number}
                                </div>
                              )}
                              {answer.answer_choices && answer.answer_choices.length > 0 && (
                                <div className="answer-choices">
                                  {answer.answer_choices.join(', ')}
                                </div>
                              )}
                              {answer.answer_file && (
                                <div className="answer-file">
                                  <FontAwesomeIcon icon={faFileText} className="file-icon" />
                                  {answer.answer_file.name || 'Fichier joint'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Date de candidature */}
              <div className="application-date">
                Candidature du {formatDate(selectedApplication.created_at)}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <FontAwesomeIcon icon={faUser} className="no-selection-icon" />
              <h3>Sélectionnez une candidature</h3>
              <p>Choisissez une candidature dans la liste pour voir les détails</p>
        </div>
      )}
        </div>
      </div>
        </>
      )}

      {/* Popup profil candidat */}
      {showCandidateProfile && selectedCandidate && (
        <CandidateProfile
          candidateData={selectedCandidate}
          onClose={() => {
            setShowCandidateProfile(false);
            setSelectedCandidate(null);
          }}
          forum={location.state?.forum || null}
        />
      )}
    </div>
  );
};

export default RecruiterApplications;
