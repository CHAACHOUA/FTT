import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaUser,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUsers,
} from 'react-icons/fa';
import '../../pages/styles/forum/ForumOffer.css';
import LogoCompany from '../../assets/Logo-FTT.png';
import SearchBarOffers from './SearchBarOffers';
import Offer from '../Offer';
import axios from 'axios';

const ForumOffers = ({ companies, forum = null }) => {
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

  useEffect(() => {
    setFilteredOffers(allOffers);
  }, [companies]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/list/`, {
          withCredentials: true
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
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/recruiters/favorites/toggle/${offerId}/`,
        {},
        { withCredentials: true }
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
    // La navigation est maintenant gérée par le composant Offer
    console.log('Offer clicked:', offer);
  };

  const getVisibleOffers = () => {
    return showOnlyFavorites
      ? filteredOffers.filter(offer => favoriteOfferIds.includes(offer.id))
      : filteredOffers;
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
            <Offer
              key={offer.id} 
              offer={offer}
              onClick={handleOfferClick}
              onToggleFavorite={toggleFavorite}
              space="candidate"
              isFavorite={favoriteOfferIds.includes(offer.id)}
              forum={forum}
              activeTab="offres"
            />
          ))}
        </div>
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
