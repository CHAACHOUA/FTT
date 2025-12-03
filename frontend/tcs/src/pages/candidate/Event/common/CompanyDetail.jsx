import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../../components/loyout/NavBar';
import SubMenu from './SubMenu';
import Loading from '../../../../components/loyout/Loading';
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaGlobe, FaPhone, FaEnvelope, FaUsers, FaBriefcase, FaCalendarAlt, FaClock, FaUserTie } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUserTie, faMapMarkerAlt as faMapMarker } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../../assets/Logo-FTT.png';
import { Button, Input, Card, Badge } from '../../../../components/common';
import '../../../../pages/styles/candidate/Dashboard.css';
import '../../../../pages/styles/forum/ForumOffer.css';
import './CompanyDetail.css';
import Offer from '../../../../components/card/offer/Offer';
import PersonCard from '../../../../components/card/common/PersonCard';
import axios from 'axios';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [currentOffersPage, setCurrentOffersPage] = useState(1);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState([]);
  const OFFERS_PER_PAGE = 6;

  useEffect(() => {
    // Récupérer les données depuis l'état de navigation ou les paramètres
    console.log('CompanyDetail - location.state:', location.state);
    if (location.state?.company && location.state?.forum) {
      console.log('CompanyDetail - Company data received:', location.state.company);
      console.log('CompanyDetail - Company offers:', location.state.company.offers);
      console.log('CompanyDetail - location.state.offers:', location.state.offers);
      console.log('CompanyDetail - location.state keys:', Object.keys(location.state));
      
      // S'assurer que les offres sont incluses dans l'objet company
      const companyData = {
        ...location.state.company,
        // Si les offres ne sont pas dans company, vérifier dans location.state
        offers: location.state.company.offers || location.state.offers || []
      };
      
      console.log('CompanyDetail - Company data after merge:', companyData);
      console.log('CompanyDetail - Company offers after merge:', companyData.offers);
      
      setCompany(companyData);
      setForum(location.state.forum);
      setLoading(false);
    } else {
      console.log('CompanyDetail - No company or forum in location.state, redirecting...');
      // Si pas de données dans l'état, rediriger vers la page entreprises
      navigate('/event/candidate/dashboard/');
    }
  }, [companyId, location.state, navigate]);

  // Récupérer les favoris
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/list/`, {
          withCredentials: true
        });
        const ids = response.data.map(offer => offer.id);
        setFavoriteOfferIds(ids);
      } catch (error) {
        console.log('Aucun favori trouvé ou erreur:', error);
        setFavoriteOfferIds([]);
      }
    };
    fetchFavorites();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  // Fonction pour construire l'URL des fichiers média
  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
    return `${mediaBaseUrl}${url}`;
  };

  // Fonction pour gérer la navigation du sous-menu
  const handleSubMenuNavigation = (tabId) => {
    navigate('/event/candidate/dashboard/', { 
      state: { 
        forum, 
        activeTab: tabId 
      } 
    });
  };

  // Gestion des favoris
  const toggleFavorite = async (offerId) => {
    try {
      const isFavorite = favoriteOfferIds.includes(offerId);
      
      if (isFavorite) {
        // Supprimer des favoris
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offerId}/`, {
          action: 'remove'
        }, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => prev.filter(id => id !== offerId));
      } else {
        // Ajouter aux favoris
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offerId}/`, {
          action: 'add'
        }, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => [...prev, offerId]);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  if (loading) return <Loading />;
  if (!company || !forum) return <p className="px-6">Entreprise introuvable.</p>;

  // Debug: vérifier les offres
  console.log('=== CompanyDetail Render Debug ===');
  console.log('Company object:', company);
  console.log('Company.offers:', company.offers);
  console.log('Company.offers type:', typeof company.offers);
  console.log('Company.offers is array:', Array.isArray(company.offers));
  console.log('Company.offers length:', company.offers?.length);
  console.log('Company keys:', Object.keys(company));
  
  // Vérifier toutes les propriétés possibles pour les offres
  console.log('Company.job_offers:', company.job_offers);
  console.log('Company.jobOffers:', company.jobOffers);
  console.log('Company.offer_list:', company.offer_list);
  
  const hasOffers = company.offers && Array.isArray(company.offers) && company.offers.length > 0;
  console.log('Has offers (final check):', hasOffers);
  console.log('=== End Debug ===');

  // Pagination des offres
  const totalOffersPages = hasOffers ? Math.ceil(company.offers.length / OFFERS_PER_PAGE) : 0;
  const startIndex = (currentOffersPage - 1) * OFFERS_PER_PAGE;
  const endIndex = startIndex + OFFERS_PER_PAGE;
  const displayedOffers = hasOffers ? company.offers.slice(startIndex, endIndex) : [];

  const handleOffersPageChange = (page) => {
    setCurrentOffersPage(page);
    // Scroll vers le haut de la section offres
    const offersSection = document.querySelector('.company-offers-section');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="dashboard-container" style={{ paddingTop: '120px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="candidate-dashboard-layout">
        <div className="candidate-sidebar">
          <SubMenu active={activeTab} setActive={handleSubMenuNavigation} forumType={forum.type} />
        </div>
        <div className="candidate-main-content">
          {/* Banner avec bloc entreprise et infos clés - Full width */}
          <div className="company-banner-section">
              <div className="company-banner-background">
                {company.banner && (
                  <img src={getMediaUrl(company.banner)} alt="Banner" className="banner-image" />
                )}
              </div>
              <div className="company-banner-content">
                {/* Bloc entreprise au centre */}
                <div className="company-main-block">
                  <div className="company-header-horizontal">
                    <div className="company-logo-container-large">
                      <img
                        src={company.logo ? getMediaUrl(company.logo) : logo}
                        alt={company.name}
                        className="company-logo-large"
                        onError={(e) => {
                          e.target.src = logo;
                        }}
                      />
                    </div>
                    <div className="company-basic-info">
                      <h2 className="company-name">{company.name}</h2>
                      
                      {/* Localisation */}
                      {company.location && (
                        <div className="company-meta-info">
                          <div className="meta-item">
                            <FaMapMarkerAlt className="meta-icon" />
                            <span>{company.location}</span>
                          </div>
                        </div>
                      )}

                      {/* Secteurs avec badges */}
                      {company.sectors && company.sectors.length > 0 && (
                        <div className="company-sectors">
                          {company.sectors.map((sector, index) => (
                            <Badge key={index} type="sector" icon={null}>
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Site web */}
                      {company.website && (
                        <div className="company-website">
                          <FaGlobe className="website-icon" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="website-link">
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section À propos de l'entreprise */}
                  {company.description && (
                    <div className="company-about-section">
                      <h3 className="about-title">À propos de l'entreprise</h3>
                      <p className="company-description">{company.description}</p>
                    </div>
                  )}
                </div>

                {/* Informations clés à droite */}
                <div className="company-key-info-section">
                  <h3 className="key-info-title">Informations clés</h3>
                  <div className="key-info-grid">
                    <div className="key-info-item">
                      <div className="key-info-icon collaborators">
                        <FaUsers />
                      </div>
                      <div className="key-info-content">
                        <span className="key-info-label">Collaborateurs</span>
                        <span className="key-info-value">{company.employees_count || company.recruiters?.length || 'N/A'}+</span>
                      </div>
                    </div>
                    <div className="key-info-item">
                      <div className="key-info-icon year">
                        <FaCalendarAlt />
                      </div>
                      <div className="key-info-content">
                        <span className="key-info-label">Année de création</span>
                        <span className="key-info-value">{company.founded_year || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="key-info-item">
                      <div className="key-info-icon offers">
                        <FaBriefcase />
                      </div>
                      <div className="key-info-content">
                        <span className="key-info-label">Offres actives</span>
                        <span className="key-info-value">{company.offers?.length || 0}</span>
                      </div>
                    </div>
                    <div className="key-info-item">
                      <div className="key-info-icon recruiters">
                        <FaUserTie />
                      </div>
                      <div className="key-info-content">
                        <span className="key-info-label">Recruteurs</span>
                        <span className="key-info-value">{company.recruiters?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
          <div className="company-detail-content">
            {/* Section recruteurs */}
            {company.recruiters && company.recruiters.length > 0 && (
              <div className="company-recruiters-section">
                <h3 className="section-title">
                  <FaUsers className="section-icon" />
                  Nos recruteurs
                </h3>
                
                <div className="recruiters-person-cards-container">
                  {company.recruiters.map((recruiter, index) => (
                    <PersonCard
                      key={recruiter.id || index}
                      person={{
                        ...recruiter,
                        company: company,
                        company_name: company.name,
                        full_name: `${recruiter.first_name} ${recruiter.last_name}`,
                        photo: recruiter.profile_picture
                      }}
                      type="recruiter"
                      showActions={false}
                      showContact={false}
                      showView={false}
                      showSend={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section offres d'emploi */}
            {hasOffers ? (
              <div className="company-offers-section">
                <div className="offers-section-header">
                  <h3 className="section-title">
                    <FaBriefcase className="section-icon" />
                    Nos offres ({company.offers.length})
                  </h3>
                </div>
                
                <div className="forum-offers-container">
                  {displayedOffers.map((offer, index) => {
                    // Transformer les données pour le composant Offer
                    const offerData = {
                      ...offer,
                      company: {
                        name: company.name,
                        logo: company.logo
                      },
                      recruiter: {
                        name: offer.recruiter_name || 'Recruteur'
                      }
                    };
                    
                    return (
                      <Offer
                        key={offer.id || index}
                        offer={offerData}
                        onClick={() => {}} // Pas d'action de clic
                        space="candidate" // Espace candidat pour afficher le bouton postuler
                        forum={forum}
                        activeTab="offres"
                        onToggleFavorite={toggleFavorite}
                        isFavorite={favoriteOfferIds.includes(offer.id)}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalOffersPages > 1 && (
                  <div className="offers-pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handleOffersPageChange(currentOffersPage - 1)}
                      disabled={currentOffersPage === 1}
                    >
                      ← Précédent
                    </button>
                    <div className="pagination-info">
                      Page {currentOffersPage} sur {totalOffersPages}
                    </div>
                    <button
                      className="pagination-btn"
                      onClick={() => handleOffersPageChange(currentOffersPage + 1)}
                      disabled={currentOffersPage === totalOffersPages}
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="company-offers-section">
                <div className="no-offers-message">
                  <FaBriefcase className="no-offers-icon" />
                  <p>Cette entreprise n'a pas encore publié d'offres d'emploi.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
