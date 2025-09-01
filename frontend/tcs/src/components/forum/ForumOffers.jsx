import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaLocationArrow,
  FaHeart,
  FaRegHeart,
  FaBuilding,
  FaUser,
  FaCalendar,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUsers,
} from 'react-icons/fa';
import { MdBusiness, MdLocationOn, MdPerson, MdInfo } from 'react-icons/md';
import '../../pages/styles/forum/ForumOffer.css';
import LogoCompany from '../../assets/Logo-FTT.png';
import SearchBarOffers from './SearchBarOffers';
import OfferDetailPopup from '../recruiter/OfferDetailPopup';
import axios from 'axios';

const ForumOffers = ({ companies }) => {
  const allOffers = companies.flatMap(company =>
    company.offers.map(offer => ({
      ...offer,
      companyName: company.name,
      logo: company.logo,
      company: company, // Ajouter l'objet company complet
      // Ajouter temporairement un profil recherché pour tester
      profile_recherche: offer.profile_recherche || "Nous recherchons un profil avec 3-5 ans d'expérience en développement web, maîtrise de React/Node.js, et une forte capacité d'adaptation."
    }))
  );

  console.log('All offers:', allOffers);

  const [filteredOffers, setFilteredOffers] = useState(allOffers);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanyPopupOpen, setIsCompanyPopupOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferDetailPopupOpen, setIsOfferDetailPopupOpen] = useState(false);

  useEffect(() => {
    setFilteredOffers(allOffers);
  }, [companies]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = response.data.map(offer => offer.id);
        setFavoriteOfferIds(ids);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (offerId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/toggle/${offerId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'liked') {
        setFavoriteOfferIds(prev => [...prev, offerId]);
      } else {
        setFavoriteOfferIds(prev => prev.filter(id => id !== offerId));
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsCompanyPopupOpen(true);
  };

  const handleCloseCompanyPopup = () => {
    setIsCompanyPopupOpen(false);
    setSelectedCompany(null);
  };

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailPopupOpen(true);
  };

  const handleCloseOfferPopup = () => {
    setIsOfferDetailPopupOpen(false);
    setSelectedOffer(null);
  };

  const getVisibleOffers = () => {
    return showOnlyFavorites
      ? filteredOffers.filter(offer => favoriteOfferIds.includes(offer.id))
      : filteredOffers;
  };

  // Fonction pour générer les initiales du recruteur
  const getInitials = (name) => {
    if (!name) return 'R';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="forum-offers-wrapper">
      <div className="forum-offers-header">
        <SearchBarOffers offers={allOffers} onFilter={setFilteredOffers} />
        <div className="favorites-toggle-container">
          <button
            className={`favorites-toggle-btn ${!showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(false)}
          >
            Tous
          </button>
          <button
            className={`favorites-toggle-btn ${showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(true)}
          >
            Favoris
          </button>
        </div>
      </div>

      {getVisibleOffers().length === 0 ? (
        <p className="text-gray-500">Aucune offre ne correspond à votre recherche.</p>
      ) : (
        <div className="forum-offers-container">
          {getVisibleOffers().map(offer => (
            <div 
              key={offer.id} 
              className="forum-offer-card"
              onClick={() => handleOfferClick(offer)}
              style={{ cursor: 'pointer' }}
            >
              {/* Section Logo et Entreprise */}
              <div className="forum-offer-company-section">
                <img
                  src={offer.logo || LogoCompany}
                  alt={offer.companyName}
                  className="forum-offer-logo"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompanyClick(offer.company);
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <div className="forum-offer-company-info">
                  <h4 className="forum-offer-company-name" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompanyClick(offer.company);
                      }}
                      style={{ cursor: 'pointer' }}>
                    {offer.companyName}
                  </h4>
                  <div className="forum-offer-company-meta">
                    <MdBusiness className="forum-offer-meta-icon" />
                    <span>{offer.sector || 'Secteur non précisé'}</span>
                  </div>
                </div>
              </div>

              {/* Section Contenu Principal */}
              <div className="forum-offer-content">
                <h3 className="forum-offer-title">{offer.title}</h3>
                <p className="forum-offer-description">{offer.description}</p>
                
                {/* Métadonnées avec icônes */}
                <div className="forum-offer-meta">
                  {offer.location && (
                    <div className="forum-offer-meta-item">
                      <MdLocationOn className="forum-offer-meta-icon" />
                      <span className="forum-meta-text">{offer.location}</span>
                    </div>
                  )}
                  {offer.contract_type && (
                    <div className="forum-offer-meta-item">
                      <FaBriefcase className="forum-offer-meta-icon" />
                      <span className="forum-meta-text">
                        <strong>Type :</strong> {offer.contract_type}
                      </span>
                    </div>
                  )}
                  {offer.created_at && (
                    <div className="forum-offer-meta-item">
                      <FaCalendar className="forum-offer-meta-icon" />
                      <span className="forum-meta-text">
                        Postée le {new Date(offer.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Section Recruteur */}
                <div className="forum-offer-recruiter-section">
                  {offer.recruiter_photo ? (
                    <img 
                      src={offer.recruiter_photo} 
                      alt={`${offer.recruiter_name || 'Recruteur'}`}
                      className="forum-offer-recruiter-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="forum-offer-recruiter-initials"
                    style={{ 
                      display: offer.recruiter_photo ? 'none' : 'flex',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#4f2cc6',
                      color: 'white',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {getInitials(offer.recruiter_name)}
                  </div>
                  <div className="forum-offer-recruiter-info">
                    <div className="forum-offer-recruiter-name">
                      {offer.recruiter_name || 'Recruteur'}
                    </div>
                    <div className="forum-offer-recruiter-role">
                      Recruteur • {offer.companyName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="forum-offer-actions">
                <button
                  className="forum-offer-action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(offer.id);
                  }}
                  title="Ajouter aux favoris"
                >
                  {favoriteOfferIds.includes(offer.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button 
                  className="forum-offer-action-button" 
                  title="Voir les détails"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOfferClick(offer);
                  }}
                >
                  <FaLocationArrow />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup pour les détails de l'offre */}
      {isOfferDetailPopupOpen && selectedOffer && (
        <OfferDetailPopup
          offer={selectedOffer}
          onClose={() => {
            setIsOfferDetailPopupOpen(false);
            setSelectedOffer(null);
          }}
        />
      )}

      {/* Popup pour les détails de l'entreprise */}
      {isCompanyPopupOpen && selectedCompany && (
        <div className="company-popup-overlay" onClick={handleCloseCompanyPopup}>
          <div className="company-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="company-popup-header">
              <h2>Détails de l'entreprise</h2>
              <button className="company-popup-close" onClick={handleCloseCompanyPopup}>
                ×
              </button>
            </div>
            
            <div className="company-popup-body">
              <div className="company-popup-logo-section">
                <img
                  src={selectedCompany.logo || LogoCompany}
                  alt={selectedCompany.name}
                  className="company-popup-logo"
                />
                <div className="company-popup-info">
                  <h3 className="company-popup-name">{selectedCompany.name}</h3>
                  {selectedCompany.sectors && (
                    <div className="company-popup-sector">
                      <FaBuilding className="company-popup-icon" />
                      <span>{selectedCompany.sectors.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="company-popup-details">
                {selectedCompany.website && (
                  <div className="company-popup-detail-item">
                    <FaGlobe className="company-popup-icon" />
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer">
                      {selectedCompany.website}
                    </a>
                  </div>
                )}
                
                <div className="company-popup-detail-item">
                  <FaUsers className="company-popup-icon" />
                  <span>{selectedCompany.recruiters.length} recruteur{selectedCompany.recruiters.length > 1 ? 's' : ''}</span>
                </div>

                {selectedCompany.description && (
                  <div className="company-popup-description">
                    <h4 className="company-section-title">Description</h4>
                    <p className="company-description">{selectedCompany.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumOffers;
