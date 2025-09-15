import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaUser, FaCalendarAlt, FaGlobe, FaPhone, FaEnvelope, FaUserTie, FaInfoCircle, FaHeart, FaShare } from 'react-icons/fa';
import Navbar from './common/NavBar';
import Loading from './common/Loading';
import logo from '../assets/Logo-FTT.png';
import './OfferDetail.css';

// Imports conditionnels pour les espaces candidat et recruiter
import CandidateSubMenu from './candidate/Event/SubMenu';
import RecruiterSubMenu from './recruiter/event/SubMenu';
import './styles/candidate/Dashboard.css';

const OfferDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('offres');
  const [forum, setForum] = useState(null);
  const [space, setSpace] = useState(null);

  useEffect(() => {
    // Récupérer les données depuis l'état de navigation uniquement
    if (location.state?.offer) {
      setOffer(location.state.offer);
      setIsFavorite(location.state.isFavorite || false);
      setForum(location.state.forum || null);
      setActiveTab(location.state.activeTab || 'offres');
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

  // Validation d'URL pour éviter les injections
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const handleBack = () => {
    // Navigation conditionnelle selon l'espace
    const space = location.state?.space;
    if (space === 'candidate' && forum) {
      navigate('/event/candidate/dashboard/', { 
        state: { 
          forum, 
          activeTab: 'offres' 
        } 
      });
    } else if (space === 'recruiter' && forum) {
      navigate('/event/recruiter/dashboard/', { 
        state: { 
          forum, 
          activeTab: 'offres' 
        } 
      });
    } else {
      navigate(-1);
    }
  };

  const handleToggleFavorite = () => {
    // Logique pour ajouter/retirer des favoris
    setIsFavorite(!isFavorite);
    // Ici vous pouvez ajouter l'appel API pour sauvegarder les favoris
  };

  const handleShare = () => {
    // Logique pour partager l'offre (sans exposer l'URL complète)
    const shareData = {
      title: offer.title || 'Offre d\'emploi',
      text: offer.description ? offer.description.substring(0, 200) + '...' : 'Découvrez cette offre d\'emploi'
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback sécurisé - copier seulement le titre
      navigator.clipboard.writeText(shareData.title + ' - ' + shareData.text);
      alert('Informations copiées dans le presse-papiers !');
    }
  };

  if (loading) return <Loading />;
  if (!offer) return <p className="px-6">Offre introuvable.</p>;

  // Déterminer si on doit afficher le layout avec submenu
  const shouldShowSubmenu = (space === 'candidate' || space === 'recruiter') && forum;

  // Contenu de l'offre
  const offerContent = (
    <div className="offer-detail-card">
      {/* Header de l'offre */}
      <div className="offer-detail-header">
        <div className="offer-company-section">
          <img
            src={offer.company?.logo || logo}
            alt={offer.company?.name || 'Entreprise'}
            className="offer-company-logo"
            onError={(e) => {
              e.target.src = logo;
            }}
          />
          <div className="offer-company-info">
            <h1 className="offer-title" dangerouslySetInnerHTML={{ __html: sanitizeText(offer.title) }}></h1>
            <div className="offer-company-name">
              <FaBuilding className="icon" />
              <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.company?.name || 'Entreprise non spécifiée') }}></span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="offer-actions">
          <button 
            className={`action-button favorite ${isFavorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <FaHeart />
          </button>
          <button 
            className="action-button share"
            onClick={handleShare}
            title="Partager l'offre"
          >
            <FaShare />
          </button>
        </div>
      </div>

      {/* Métadonnées */}
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
            <FaBuilding className="meta-icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.sector) }}></span>
          </div>
        )}
        {offer.start_date && (
          <div className="offer-meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>Début : {formatDate(offer.start_date)}</span>
          </div>
        )}
        {offer.salary && (
          <div className="offer-meta-item">
            <FaInfoCircle className="meta-icon" />
            <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.salary) }}></span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="offer-description-section">
        <h3 className="section-title">
          <FaInfoCircle className="section-icon" />
          Description du poste
        </h3>
        <div className="offer-description" dangerouslySetInnerHTML={{ __html: sanitizeText(offer.description) }}>
        </div>
      </div>

      {/* Informations sur l'entreprise */}
      {offer.company && (
        <div className="company-info-section">
          <h3 className="section-title">
            <FaBuilding className="section-icon" />
            À propos de l'entreprise
          </h3>
          <div className="company-info-grid">
            {offer.company.website && isValidUrl(offer.company.website) && (
              <div className="company-info-item">
                <FaGlobe className="info-icon" />
                <a href={offer.company.website} target="_blank" rel="noopener noreferrer">
                  {sanitizeText(offer.company.website)}
                </a>
              </div>
            )}
            {offer.company.email && (
              <div className="company-info-item">
                <FaEnvelope className="info-icon" />
                <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.company.email) }}></span>
              </div>
            )}
            {offer.company.phone && (
              <div className="company-info-item">
                <FaPhone className="info-icon" />
                <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.company.phone) }}></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informations sur le recruteur */}
      {offer.recruiter && (
        <div className="recruiter-info-section">
          <h3 className="section-title">
            <FaUserTie className="section-icon" />
            Contact recruteur
          </h3>
          <div className="recruiter-info">
            <div className="recruiter-avatar">
              {offer.recruiter.name ? 
                offer.recruiter.name.split(' ').map(name => name.charAt(0)).join('').toUpperCase() :
                'R'
              }
            </div>
            <div className="recruiter-details">
              <div className="recruiter-name" dangerouslySetInnerHTML={{ __html: sanitizeText(offer.recruiter.name || 'Recruteur') }}>
              </div>
              <div className="recruiter-role" dangerouslySetInnerHTML={{ __html: sanitizeText('Recruteur • ' + (offer.company?.name || 'Entreprise')) }}>
              </div>
              {offer.recruiter.email && (
                <div className="recruiter-contact">
                  <FaEnvelope className="contact-icon" />
                  <span dangerouslySetInnerHTML={{ __html: sanitizeText(offer.recruiter.email) }}></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date de publication */}
      <div className="offer-date-section">
        <FaCalendarAlt className="date-icon" />
        <span>Offre publiée le {formatDate(offer.created_at)}</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      
      {shouldShowSubmenu ? (
        // Layout avec submenu pour candidat et recruiter
        <div className="candidate-dashboard-layout">
          <div className="candidate-sidebar">
            {space === 'candidate' ? (
              <CandidateSubMenu active={activeTab} setActive={setActiveTab} forumType={forum.type} />
            ) : (
              <RecruiterSubMenu active={activeTab} setActive={setActiveTab} />
            )}
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
            
            <div className="offer-detail-content">
              {offerContent}
            </div>
          </div>
        </div>
      ) : (
        // Layout simple pour les autres espaces
        <div className="offer-detail-content">
          {/* Bouton retour */}
          <button onClick={handleBack} className="back-button">
            <FaArrowLeft />
            Retour
          </button>
          
          {offerContent}
        </div>
      )}
    </div>
  );
};

export default OfferDetail;