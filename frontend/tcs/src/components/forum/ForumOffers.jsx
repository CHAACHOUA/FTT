import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaUser,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import '../../pages/styles/forum/ForumOffer.css';
import LogoCompany from '../../assets/Logo-FTT.png';
import SearchBarOffers from '../filters/offer/SearchBarOffers';
import Offer from '../card/offer/Offer';
import axios from 'axios';

const ForumOffers = ({ companies, forum = null }) => {
  // Préparer toutes les offres avec les informations de l'entreprise
  const allOffers = companies.flatMap(company =>
    company.offers.map(offer => ({
      ...offer,
      companyName: company.name,
      logo: company.logo,
      company: company,
      profile_recherche: offer.profile_recherche || "Profil recherché non spécifié"
    }))
  );

  const [filteredOffers, setFilteredOffers] = useState(allOffers);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanyPopupOpen, setIsCompanyPopupOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [loading, setLoading] = useState(false);

  // Mettre à jour les offres filtrées quand les entreprises changent
  useEffect(() => {
    setFilteredOffers(allOffers);
  }, [companies]);

  // Récupérer les favoris
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/list/`, {
          withCredentials: true
        });
        const ids = response.data.map(offer => offer.id);
        setFavoriteOfferIds(ids);
      } catch (error) {
        console.log('Aucun favori trouvé ou erreur:', error);
        setFavoriteOfferIds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Fonction pour obtenir les offres visibles selon les filtres
  const getVisibleOffers = () => {
    let offers = showOnlyFavorites 
      ? allOffers.filter(offer => favoriteOfferIds.includes(offer.id))
      : allOffers;

    // Filtrage par recherche
    if (searchTerm) {
      offers = offers.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par secteur
    if (selectedSector) {
      offers = offers.filter(offer => offer.sector === selectedSector);
    }

    // Filtrage par type de contrat
    if (selectedContractType) {
      offers = offers.filter(offer => offer.contract_type === selectedContractType);
    }

    return offers;
  };

  // Gestion des favoris
  const toggleFavorite = async (offerId) => {
    try {
      const isFavorite = favoriteOfferIds.includes(offerId);
      
      if (isFavorite) {
        // Supprimer des favoris
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offerId}/`, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => prev.filter(id => id !== offerId));
      } else {
        // Ajouter aux favoris
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/candidates/favorites/${offerId}/`, {}, {
          withCredentials: true
        });
        setFavoriteOfferIds(prev => [...prev, offerId]);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  // Gestion du clic sur une offre
  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    // Pour les forums virtuels, ouvrir le modal de candidature
    if (forum && (forum.type === 'virtuel' || forum.is_virtual)) {
      // Le modal sera géré par le composant Offer
      return;
    }
    // Pour les autres forums, afficher les détails
    console.log('Offre sélectionnée:', offer);
  };

  // Gestion du clic sur une entreprise
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsCompanyPopupOpen(true);
  };

  // Fermer le popup d'entreprise
  const handleCloseCompanyPopup = () => {
    setIsCompanyPopupOpen(false);
    setSelectedCompany(null);
  };

  // Obtenir les secteurs uniques
  const getUniqueSectors = () => {
    const sectors = [...new Set(allOffers.map(offer => offer.sector).filter(Boolean))];
    return sectors;
  };

  // Obtenir les types de contrat uniques
  const getUniqueContractTypes = () => {
    const contractTypes = [...new Set(allOffers.map(offer => offer.contract_type).filter(Boolean))];
    return contractTypes;
  };

  if (loading) {
    return (
      <div className="offers-list-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-list-wrapper">
      {/* En-tête avec titre et filtres */}
      <div className="offers-list-header">
        <h2>Offres d'emploi ({getVisibleOffers().length})</h2>
        
        {/* Boutons de filtrage */}
        <div className="offers-filter-buttons">
          <button
            className={`filter-btn ${!showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(false)}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(true)}
          >
            <FaHeart /> Favoris
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="offers-search-section">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Secteur</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les secteurs</option>
              {getUniqueSectors().map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Type de contrat</label>
            <select
              value={selectedContractType}
              onChange={(e) => setSelectedContractType(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les types</option>
              {getUniqueContractTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des offres */}
      {getVisibleOffers().length === 0 ? (
        <div className="no-offers-message">
          <FaBuilding className="no-offers-icon" />
          <h3>Aucune offre trouvée</h3>
          <p>
            {showOnlyFavorites 
              ? "Vous n'avez pas encore d'offres en favoris."
              : "Aucune offre ne correspond à vos critères de recherche."
            }
          </p>
        </div>
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
                  src={selectedCompany.logo ? (selectedCompany.logo.startsWith('http') ? selectedCompany.logo : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${selectedCompany.logo}`) : LogoCompany}
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