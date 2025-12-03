import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faCalendar,
  faClock,
  faVideo,
  faCheck,
  faClock as faClockIcon,
  faChartLine,
  faUsers,
  faBriefcase,
  faMapMarkerAlt,
  faBuilding,
  faFileAlt,
  faIndustry,
  faDownload,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import InterviewBoard from '../../../../components/trello/InterviewBoard';
import Loading from '../../../../components/loyout/Loading';
import CandidateCard from '../../../../components/card/candidate/CandidateCard';
import CandidateProfile from '../../../candidate/profile/CandidateProfile';
import Offer from '../../../../components/card/offer/Offer';
import './InterviewManagement.css';

// Fonction utilitaire pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Non défini';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  } catch (error) {
    return 'Date invalide';
  }
};

const InterviewManagement = ({ forumId, forum }) => {
  const API = process.env.REACT_APP_API_BASE_URL;
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]); // Interviews du tableau de gestion uniquement
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);

  useEffect(() => {
    if (forumId) {
      loadData();
    }
  }, [forumId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les applications acceptées (entretiens programmés)
      const applicationsRes = await axios.get(
        `${API}/virtual/forums/${forumId}/applications/recruiter/`,
        { withCredentials: true }
      );
      
      // Filtrer les applications acceptées avec créneaux
      const acceptedApplications = applicationsRes.data.filter(
        app => app.status === 'accepted' && app.selected_slot_info
      );
      
      setApplications(acceptedApplications);
      
      // Ne pas initialiser interviews ici - ils seront chargés par InterviewBoard
      // qui filtre uniquement les interviews avec type='video' et meeting_link
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Callback pour recevoir les mises à jour depuis InterviewBoard
  const handleInterviewsChange = (allInterviews) => {
    // Convertir la structure d'InterviewBoard en structure plate pour calculateProgress
    const flatInterviews = allInterviews.map(interview => ({
      id: interview.id,
      application: interview.application,
      candidate: interview.candidate,
      status: interview.status,
      slotInfo: interview.slotInfo
    }));
    setInterviews(flatInterviews);
  };

  // Calculer les statistiques de progression
  const calculateProgress = () => {
    if (interviews.length === 0) return { percentage: 0, scheduled: 0, inProgress: 0, completed: 0, total: 0 };
    
    const scheduled = interviews.filter(i => i.status === 'scheduled' || !i.status).length;
    const inProgress = interviews.filter(i => i.status === 'inProgress').length;
    const completed = interviews.filter(i => i.status === 'completed').length;
    const total = interviews.length;
    
    // Calcul du pourcentage : 0% si rien, 50% si programmés, 75% si en cours, 100% si terminés
    const percentage = total > 0 
      ? Math.round((completed * 100 + inProgress * 75 + scheduled * 50) / (total * 100) * 100)
      : 0;
    
    return { percentage, scheduled, inProgress, completed, total };
  };

  const progress = calculateProgress();

  // Filtrer les candidatures pour l'affichage
  const filteredApplications = applications.filter(app => {
    const searchMatch = !searchTerm || 
      (app.candidate_name && app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.candidate_email && app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.offer?.title && app.offer.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  // Convertir les applications en format candidat pour CandidateCard
  const getCandidateFromApplication = (application) => {
    // Utiliser candidate_profile si disponible (objet complet), sinon construire depuis les champs disponibles
    const candidateProfile = application.candidate_profile || {};
    const candidate = application.candidate || {};
    
    // Fusionner les données : priorité à candidate_profile, puis aux champs individuels
    return {
      ...candidateProfile,
      ...candidate,
      // Informations de base
      id: candidateProfile.id || candidate.id || application.candidate,
      first_name: candidateProfile.first_name || candidate.first_name || application.candidate_name?.split(' ')[0] || 'Candidat',
      last_name: candidateProfile.last_name || candidate.last_name || application.candidate_name?.split(' ').slice(1).join(' ') || '',
      email: candidateProfile.email || candidate.email || application.candidate_email,
      // Photo de profil
      profile_picture: candidateProfile.profile_picture || application.candidate_photo || candidate.profile_picture,
      // CV
      cv_file: candidateProfile.cv_file || candidate.cv_file || application.cv_file,
      // Recherche (secteur et région) - priorité au candidate_profile.search
      search: candidateProfile.search && (candidateProfile.search.sector?.length > 0 || candidateProfile.search.region) 
        ? candidateProfile.search 
        : {
            sector: application.offer?.sector ? [application.offer.sector] : [],
            region: application.offer?.location || ''
          },
      // Autres champs du profil
      phone: candidateProfile.phone || candidate.phone,
      birth_date: candidateProfile.birth_date || candidate.birth_date,
      address: candidateProfile.address || candidate.address,
      city: candidateProfile.city || candidate.city,
      postal_code: candidateProfile.postal_code || candidate.postal_code,
      country: candidateProfile.country || candidate.country,
      linkedin: candidateProfile.linkedin || candidate.linkedin,
      github: candidateProfile.github || candidate.github,
      portfolio: candidateProfile.portfolio || candidate.portfolio,
      bio: candidateProfile.bio || candidate.bio,
      educations: candidateProfile.education || candidateProfile.educations || candidate.education || candidate.educations || [],
      experiences: candidateProfile.experience || candidateProfile.experiences || candidate.experience || candidate.experiences || [],
      candidate_languages: candidateProfile.languages || candidateProfile.candidate_languages || candidate.languages || candidate.candidate_languages || [],
      skills: candidateProfile.skills || candidate.skills || [],
    };
  };

  // Télécharger le CV du candidat
  const handleDownloadCV = () => {
    if (!selectedCandidate?.cv_file) {
      toast.error('CV non disponible');
      return;
    }

    const cvUrl = selectedCandidate.cv_file.startsWith('http')
      ? selectedCandidate.cv_file
      : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${selectedCandidate.cv_file}`;
    
    window.open(cvUrl, '_blank');
    toast.success('Téléchargement du CV en cours...');
  };

  // Ouvrir le profil du candidat
  const handleViewProfile = () => {
    if (!selectedCandidate) {
      toast.error('Aucun candidat sélectionné');
      return;
    }
    setShowCandidateProfile(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="interview-management-container">
      <div className="interview-management-header">
        <h1>Gestion des Entretiens</h1>
        <p>Organisez et suivez vos entretiens avec les candidats</p>
      </div>

      <div className="interview-management-grid">
        {/* Partie 1 : Indicateur de progression circulaire */}
        <div className="progress-section">
          <h2 className="section-title">Progression</h2>
          <div className="circular-progress-container">
            <div className="circular-progress">
              <svg className="progress-ring" width="70" height="70">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                  fill="transparent"
                  r="28"
                  cx="35"
                  cy="35"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="transparent"
                  r="28"
                  cx="35"
                  cy="35"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress.percentage / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
              </svg>
              <div className="progress-content">
                <span className="progress-percentage">{progress.percentage}%</span>
                <span className="progress-label">Complété</span>
              </div>
            </div>
            <div className="progress-stats-grid">
              <div className="progress-stat-item">
                <div className="stat-icon scheduled">
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{progress.scheduled}</span>
                  <span className="progress-label">Programmés</span>
                </div>
              </div>
              <div className="progress-stat-item">
                <div className="stat-icon in-progress">
                  <FontAwesomeIcon icon={faClockIcon} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{progress.inProgress}</span>
                  <span className="progress-label">En cours</span>
                </div>
              </div>
              <div className="progress-stat-item">
                <div className="stat-icon completed">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{progress.completed}</span>
                  <span className="progress-label">Terminés</span>
                </div>
              </div>
              <div className="progress-stat-item">
                <div className="stat-icon total">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{progress.total}</span>
                  <span className="progress-label">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partie 2 : Tableau Trello */}
        <div className="trello-section">
          <h2 className="section-title">Tableau de gestion</h2>
          <InterviewBoard 
            forumId={forumId} 
            onCardClick={(application) => {
              console.log('🎯 Card clicked, application:', application);
              if (application) {
                setSelectedApplication(application);
                const candidate = getCandidateFromApplication(application);
                setSelectedCandidate(candidate);
                console.log('✅ Selected application and candidate set');
              } else {
                console.error('❌ Application is null or undefined');
              }
            }}
            onInterviewsChange={handleInterviewsChange}
          />
        </div>

        {/* Partie 3 : Zone d'affichage des candidatures */}
        <div className="candidates-section">
          <div className="candidates-header">
            <h2 className="section-title">Candidat et Offre</h2>
          </div>
          
          {selectedApplication ? (
            <div className="selected-application-details">
              {/* Component CandidateCard */}
              <div className="candidate-component-container">
                <CandidateCard
                  candidate={selectedCandidate}
                  apiBaseUrl={API}
                  onCandidateClick={handleViewProfile}
                  forum={forum}
                />
              </div>
              
              {/* Component Offer */}
              {selectedApplication.offer && (
                <div className="offer-component-container">
                  <Offer
                    offer={selectedApplication.offer}
                    space="recruiter"
                    forum={forum}
                    onClick={() => {}}
                    className="interview-offer-component"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state-candidates">
              <FontAwesomeIcon icon={faUser} className="empty-icon" />
              <h3>Aucune sélection</h3>
              <p>Cliquez sur une card dans le tableau de gestion pour afficher les détails du candidat et de l'offre.</p>
            </div>
          )}
        </div>

        {/* Popup profil candidat */}
        {showCandidateProfile && selectedCandidate && (
          <CandidateProfile
            candidateData={selectedCandidate}
            onClose={() => setShowCandidateProfile(false)}
            forum={forum}
          />
        )}

        {/* Partie 4 : Statistiques et informations */}
        <div className="stats-section">
          <h2 className="section-title">Statistiques</h2>
          <div className="stats-content">
            <div className="stat-card">
              <div className="stat-card-icon blue">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{interviews.filter(i => i.slotInfo?.type === 'video').length}</span>
                <span className="stat-card-label">Entretiens vidéo</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-icon green">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{progress.completed}</span>
                <span className="stat-card-label">Entretiens terminés</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-icon orange">
                <FontAwesomeIcon icon={faCalendar} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">
                  {new Set(interviews.map(i => i.slotInfo?.date)).size}
                </span>
                <span className="stat-card-label">Jours avec entretiens</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-icon purple">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">
                  {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
                </span>
                <span className="stat-card-label">Taux de complétion</span>
              </div>
            </div>
          </div>

          {/* Informations rapides */}
          <div className="quick-info">
            <h3 className="quick-info-title">Informations</h3>
            <div className="quick-info-list">
              <div className="quick-info-item">
                <FontAwesomeIcon icon={faUsers} className="quick-info-icon" />
                <span>{applications.length} candidat{applications.length > 1 ? 's' : ''} en entretien</span>
              </div>
              <div className="quick-info-item">
                <FontAwesomeIcon icon={faClock} className="quick-info-icon" />
                <span>
                  Prochain entretien : {
                    interviews
                      .filter(i => i.status === 'scheduled' && i.slotInfo?.date)
                      .sort((a, b) => new Date(a.slotInfo.date) - new Date(b.slotInfo.date))[0]
                      ? formatDate(interviews
                          .filter(i => i.status === 'scheduled' && i.slotInfo?.date)
                          .sort((a, b) => new Date(a.slotInfo.date) - new Date(b.slotInfo.date))[0]
                          .slotInfo.date)
                      : 'Aucun'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewManagement;

