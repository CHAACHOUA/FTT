import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaMapMarkerAlt, FaTrophy, FaDownload, FaEnvelope, FaPhone, FaGraduationCap, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import Navbar from './common/NavBar';
import Loading from './common/Loading';
import './MatchingDetail.css';

// Imports conditionnels pour les espaces candidat et recruiter
import CandidateSubMenu from './candidate/Event/SubMenu';
import RecruiterSubMenu from './recruiter/event/SubMenu';
import './styles/candidate/Dashboard.css';

const MatchingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matching');
  const [forum, setForum] = useState(null);
  const [space, setSpace] = useState(null);

  useEffect(() => {
    // Récupérer les données depuis l'état de navigation uniquement
    if (location.state?.offer && location.state?.candidates) {
      setOffer(location.state.offer);
      setCandidates(location.state.candidates);
      setForum(location.state.forum || null);
      setActiveTab(location.state.activeTab || 'matching');
      setSpace(location.state.space || null);
      setLoading(false);
    } else {
      // Si pas de données dans l'état, rediriger vers la page précédente
      navigate(-1);
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction de sécurisation pour éviter XSS
  const sanitizeText = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  // Fonction pour déterminer le classement relatif
  const getRelativeRanking = (candidates, currentScore) => {
    const sortedCandidates = [...candidates].sort((a, b) => {
      const scoreA = a.match_score ?? a.score ?? 0;
      const scoreB = b.match_score ?? b.score ?? 0;
      return scoreB - scoreA;
    });

    const position = sortedCandidates.findIndex(candidate => {
      const score = candidate.match_score ?? candidate.score ?? 0;
      return score === currentScore;
    });

    return {
      rank: position + 1,
      total: candidates.length,
      label: getRankingLabel(position + 1, candidates.length),
      color: getRankingColor(position + 1, candidates.length)
    };
  };

  const getRankingLabel = (rank, total) => {
    if (rank === 1) return '1er';
    if (rank === 2) return '2ème';
    if (rank === 3) return '3ème';
    return `${rank}ème`;
  };

  const getRankingColor = (rank, total) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 20) return '#10b981';
    if (percentage <= 40) return '#3b82f6';
    if (percentage <= 60) return '#f59e0b';
    if (percentage <= 80) return '#ef4444';
    return '#6b7280';
  };

  const handleBack = () => {
    // Navigation conditionnelle selon l'espace
    if (space === 'recruiter' && forum) {
      navigate('/event/recruiter/dashboard/', { 
        state: { 
          forum, 
          activeTab: 'matching' 
        } 
      });
    } else {
      navigate(-1);
    }
  };

  if (loading) return <Loading />;
  if (!offer || !candidates) return <p className="px-6">Résultats de matching introuvables.</p>;

  // Déterminer si on doit afficher le layout avec submenu
  const shouldShowSubmenu = (space === 'recruiter') && forum;

  // Contenu des résultats de matching
  const matchingContent = (
    <div className="matching-detail-card">
      {/* Header de l'offre */}
      <div className="matching-detail-header">
        <div className="offer-section">
          <h1 className="matching-offer-title" dangerouslySetInnerHTML={{ __html: sanitizeText(offer.title) }}></h1>
          <div className="offer-company-info">
            <FaBriefcase className="icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.company?.name || 'Entreprise non spécifiée') }}></span>
          </div>
        </div>
        
        <div className="matching-stats">
          <div className="stats-item">
            <FaTrophy className="stats-icon" />
            <span className="stats-number">{candidates.length}</span>
            <span className="stats-label">Candidats trouvés</span>
          </div>
        </div>
      </div>

      {/* Métadonnées de l'offre */}
      <div className="offer-meta-grid">
        {offer.location && (
          <div className="offer-meta-item">
            <FaMapMarkerAlt className="meta-icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.location) }}></span>
          </div>
        )}
        {offer.contract_type && (
          <div className="offer-meta-item">
            <FaBriefcase className="meta-icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.contract_type) }}></span>
          </div>
        )}
        {offer.sector && (
          <div className="offer-meta-item">
            <FaBriefcase className="meta-icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.sector) }}></span>
          </div>
        )}
      </div>

      {/* Liste des candidats */}
      <div className="candidates-section">
        <h3 className="section-title">
          <FaUserCircle className="section-icon" />
          Candidats correspondants
        </h3>
        
        <div className="matching-candidates-grid">
          {candidates.map((candidate, index) => {
            const score = candidate.match_score ?? candidate.score ?? null;
            const ranking = score !== null ? getRelativeRanking(candidates, score) : null;
            
            return (
              <div key={index} className="matching-candidate-card">
                <div className="matching-candidate-photo">
                  {candidate.profile_picture ? (
                    <img
                      src={
                        candidate.profile_picture.startsWith('http')
                          ? candidate.profile_picture
                          : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${candidate.profile_picture}`
                      }
                      alt={`${candidate.first_name} ${candidate.last_name}`}
                    />
                  ) : (
                    <FaUserCircle className="matching-default-avatar" />
                  )}
                </div>

                <div className="matching-candidate-info">
                  <h4 className="matching-candidate-name" dangerouslySetInnerHTML={{ __html: sanitizeText(`${candidate.first_name} ${candidate.last_name}`) }}></h4>
                </div>
                
                {candidate.cv_file && (
                  <a
                    href={
                      candidate.cv_file.startsWith('http')
                        ? candidate.cv_file
                        : `${process.env.REACT_APP_API_BASE_URL}${candidate.cv_file}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="matching-cv-download"
                    title="Télécharger le CV"
                  >
                    <FaDownload />
                  </a>
                )}

                {/* Score de matching */}
                {score !== null && ranking && (
                  <div className="matching-score-section">
                    <div className="matching-score-header">
                      <FaTrophy className="matching-trophy-icon" />
                      <span className="matching-score-label">Score</span>
                      <div className="matching-ranking">
                        <span className="matching-ranking-number">{ranking.rank}/{ranking.total}</span>
                        <span className="matching-ranking-label" style={{ color: ranking.color }}>
                          {ranking.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="matching-progress-container">
                      <div className="matching-progress-bar">
                        <div 
                          className="matching-progress-fill"
                          style={{ 
                            width: `${score}%`,
                            backgroundColor: ranking.color
                          }}
                        ></div>
                      </div>
                      <span className="matching-percentage">{score}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date de matching */}
      <div className="matching-date-section">
        <FaCalendarAlt className="date-icon" />
        <span>Matching effectué le {formatDate(new Date().toISOString())}</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      
      {shouldShowSubmenu ? (
        // Layout avec submenu pour recruiter
        <div className="candidate-dashboard-layout">
          <div className="candidate-sidebar">
            <RecruiterSubMenu active={activeTab} setActive={setActiveTab} />
          </div>
          <div className="candidate-main-content">
            {/* Header avec bouton retour */}
            <div className="company-detail-header">
              <button 
                className="back-button"
                onClick={handleBack}
              >
                <FaArrowLeft />
                Retour
              </button>
              <div className="forum-info">
                <h1 className="company-detail-title" dangerouslySetInnerHTML={{ __html: sanitizeText(forum.name) }}></h1>
                <div className="forum-date">
                  <FaCalendarAlt className="date-icon" />
                  {formatDate(forum.start_date)} - {formatDate(forum.end_date)}
                </div>
              </div>
            </div>
            
            <div className="matching-detail-content">
              {matchingContent}
            </div>
          </div>
        </div>
      ) : (
        // Layout simple pour les autres espaces
        <div className="matching-detail-content">
          {/* Bouton retour */}
          <button onClick={handleBack} className="back-button">
            <FaArrowLeft />
            Retour
          </button>
          
          {matchingContent}
        </div>
      )}
    </div>
  );
};

export default MatchingDetail;
