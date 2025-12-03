import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaUser, FaCalendarAlt, FaUserTie, FaInfoCircle, FaHeart, FaShare, FaClock } from 'react-icons/fa';
import Navbar from './NavBar';
import Loading from './Loading';
import logo from '../../assets/Logo-FTT.png';
import { Button, Badge, Card, Input } from '../common';
import './OfferDetail.css';

// Imports conditionnels pour les espaces candidat et recruiter
import CandidateSubMenu from '../../pages/candidate/Event/common/SubMenu';
import RecruiterSubMenu from '../../pages/recruiter/event/common/SubMenu';
import CandidateApplicationPage from '../../pages/candidate/Event/virtual/CandidateApplicationPage';
import '../../pages/styles/candidate/Dashboard.css';
import axios from 'axios';

const OfferDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('offres');
  const [forum, setForum] = useState(null);
  const [space, setSpace] = useState(null);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

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

  // Récupérer les favoris
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/list/`, {
          withCredentials: true
        });
        const ids = response.data.map(offer => offer.id);
        setFavoriteOfferIds(ids);
        if (offer && ids.includes(offer.id)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.log('Aucun favori trouvé ou erreur:', error);
        setFavoriteOfferIds([]);
      }
    };
    if (space === 'candidate') {
      fetchFavorites();
    }
  }, [space, offer]);

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

  // Fonction pour gérer la navigation du sous-menu
  const handleSubMenuNavigation = (tabId) => {
    const space = location.state?.space;
    if (space === 'candidate' && forum) {
      navigate('/event/candidate/dashboard/', { 
        state: { 
          forum, 
          activeTab: tabId 
        } 
      });
    } else if (space === 'recruiter' && forum) {
      navigate('/event/recruiter/dashboard/', { 
        state: { 
          forum, 
          activeTab: tabId 
        } 
      });
    }
  };

  // Fonction pour construire l'URL des fichiers média
  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
    return `${mediaBaseUrl}${url}`;
  };

  const handleToggleFavorite = async () => {
    if (!offer || space !== 'candidate') return;
    
    try {
      const wasFavorite = favoriteOfferIds.includes(offer.id);
      
      if (wasFavorite) {
        // Supprimer des favoris
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offer.id}/`, {
          action: 'remove'
        }, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => prev.filter(id => id !== offer.id));
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offer.id}/`, {
          action: 'add'
        }, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => [...prev, offer.id]);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
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

  // Vérifier si c'est un forum virtuel ou hybride pour afficher le bouton postuler
  const isVirtualOrHybrid = forum && (forum.type === 'virtuel' || forum.type === 'hybrid');
  
  // Contenu de l'offre avec le même design que CompanyDetail
  const offerContent = (
    <div className="offer-detail-content-wrapper">
      {/* Banner avec bloc offre et infos clés */}
      <div className="offer-banner-section">
        <div className="offer-banner-background">
          {offer.company?.banner ? (
            <img src={getMediaUrl(offer.company.banner)} alt="Banner" className="banner-image" />
          ) : offer.company?.logo ? (
            <div className="banner-placeholder" style={{ background: 'linear-gradient(135deg, #18386c 0%, #06b6d4 100%)' }}></div>
          ) : null}
        </div>
        <div className="offer-banner-content">
          {/* Bloc offre principal */}
          <div className="offer-main-block">
            <div className="offer-header-horizontal">
              <div className="offer-logo-container-large">
                <img
                  src={offer.company?.logo ? getMediaUrl(offer.company.logo) : logo}
                  alt={offer.company?.name || 'Entreprise'}
                  className="offer-logo-large"
                  onError={(e) => {
                    e.target.src = logo;
                  }}
                />
              </div>
              <div className="offer-basic-info">
                <h2 className="offer-name">{offer.title}</h2>
                <div className="offer-company-name">
                  <FaBuilding className="meta-icon" />
                  <span>{offer.company?.name || 'Entreprise non spécifiée'}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {offer.description && (
              <div className="offer-description-section">
                <h3 className="offer-description-title">Description</h3>
                <div className="offer-description">
                  {offer.description}
                </div>
              </div>
            )}
            
            {/* Profil recherché */}
            {offer.profile_recherche && (
              <div className="offer-description-section">
                <h3 className="offer-description-title">Profil recherché</h3>
                <div className="offer-description">
                  {offer.profile_recherche}
                </div>
              </div>
            )}
          </div>
          
          {/* Bloc infos clés à droite */}
          <div className="offer-key-info-section">
            <h3 className="key-info-title">Informations clés</h3>
            <div className="key-info-items">
              {offer.location && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Localisation</div>
                    <div className="key-info-value">{offer.location}</div>
                  </div>
                </div>
              )}
              {offer.contract_type && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaBriefcase />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Type de contrat</div>
                    <div className="key-info-value">{offer.contract_type}</div>
                  </div>
                </div>
              )}
              {offer.sector && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaBuilding />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Secteur</div>
                    <div className="key-info-value">{offer.sector}</div>
                  </div>
                </div>
              )}
              {offer.start_date && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Date de début</div>
                    <div className="key-info-value">{formatDate(offer.start_date)}</div>
                  </div>
                </div>
              )}
              {offer.experience_display && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaClock />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Expérience</div>
                    <div className="key-info-value">{offer.experience_display}</div>
                  </div>
                </div>
              )}
              {offer.recruiter && (offer.recruiter.first_name || offer.recruiter.last_name || offer.recruiter_name) && (
                <div className="key-info-item">
                  <div className="key-info-icon">
                    <FaUserTie />
                  </div>
                  <div className="key-info-content">
                    <div className="key-info-label">Recruteur</div>
                    <div className="key-info-value">
                      {offer.recruiter.first_name && offer.recruiter.last_name 
                        ? `${offer.recruiter.first_name} ${offer.recruiter.last_name}`
                        : offer.recruiter_name || 'Non spécifié'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="offer-actions-section">
              {space === 'candidate' && (
                <>
                  <button 
                    className={`offer-action-button favorite ${isFavorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {isFavorite ? <FaHeart /> : <FaHeart style={{ opacity: 0.5 }} />}
                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </button>
                  {isVirtualOrHybrid && (
                    <button 
                      className="offer-action-button apply"
                      onClick={() => {
                        setIsApplicationModalOpen(true);
                      }}
                    >
                      Postuler
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
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
              <CandidateSubMenu active={activeTab} setActive={handleSubMenuNavigation} forumType={forum.type} />
            ) : (
              <RecruiterSubMenu active={activeTab} setActive={handleSubMenuNavigation} />
            )}
          </div>
          <div className="candidate-main-content">
            <div className="offer-detail-content-wrapper">
              {offerContent}
            </div>
          </div>
        </div>
      ) : (
        // Layout simple pour les autres espaces
        <div className="offer-detail-content-wrapper">
          {offerContent}
        </div>
      )}
      
      {/* Modal de candidature */}
      {isApplicationModalOpen && offer && forum && createPortal(
        <CandidateApplicationPage
          isModal={true}
          onClose={() => setIsApplicationModalOpen(false)}
          offer={offer}
          forum={forum}
        />,
        document.body
      )}
    </div>
  );
};

export default OfferDetail;