import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../common';
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
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import '../../pages/organizer/Event/offers/OffersList.css';
import '../../pages/styles/organizer/organizer-buttons.css';
import '../../components/filters/offer/SearchBar.css';
import LogoCompany from '../../assets/Logo-FTT.png';
import SearchBarOffers from '../filters/offer/SearchBarOffers';
import Offer from '../card/offer/Offer';
import Loading from '../loyout/Loading';
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
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
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

    // Filtrage par secteurs (sélection multiple)
    if (selectedSectors.length > 0) {
      offers = offers.filter(offer => selectedSectors.includes(offer.sector));
    }

    // Filtrage par types de contrat (sélection multiple)
    if (selectedContractTypes.length > 0) {
      offers = offers.filter(offer => selectedContractTypes.includes(offer.contract_type));
    }

    return offers;
  };

  // Gestion des favoris
  const toggleFavorite = async (offerId) => {
    try {
      const isFavorite = favoriteOfferIds.includes(offerId);
      
      if (isFavorite) {
        // Supprimer des favoris - utiliser POST avec action=remove
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

  // Fonction pour toggle une valeur dans une liste
  const toggleValue = (list, value, setter) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="organizer-offers-container" >
      <div className="organizer-offers-content">
        {/* Conteneur centré pour la recherche et les offres */}
        <div className="offers-main-container">
          <div className="page-title-section">
            <h1>Liste des Offres</h1>
            <p>Consultez toutes les offres postées par les recruteurs</p>
          </div>
          
          {/* Filtres avec le style des forums */}
          <div className="search-bar-wrapper-search">
            <div className="search-bar-search">
              <input
                className="search-input-search"
                type="text"
                placeholder="Cherchez un job par intitulé, mot clé ou entreprise"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <FaTimes className="clear-icon-search" onClick={() => setSearchTerm('')} />
              )}

              {/* Bouton Favoris */}
              <div className="dropdown-wrapper-search">
                <button
                  className={`dropdown-toggle-search ${showOnlyFavorites ? 'active' : ''}`}
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                >
                  <FaHeart /> Favoris
                </button>
              </div>

              {/* Secteur avec sélection multiple */}
              <div className="dropdown-wrapper-search">
                <button
                  className="dropdown-toggle-search"
                  onClick={() => {
                    setShowSectorDropdown(prev => !prev);
                    setShowContractDropdown(false);
                  }}
                >
                  Secteur <FaChevronDown />
                </button>
                {showSectorDropdown && (
                  <div className="dropdown-menu-search">
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                      <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Secteurs</strong>
                    </div>
                    {getUniqueSectors().map(sector => (
                      <label key={sector} className="dropdown-item-search">
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sector)}
                            onChange={() => toggleValue(selectedSectors, sector, setSelectedSectors)}
                            style={{ marginRight: '12px' }}
                          />
                          <span style={{ flex: 1 }}>{sector}</span>
                        </div>
                      </label>
                    ))}
                    {selectedSectors.length > 0 && (
                      <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                        <button
                          onClick={() => setSelectedSectors([])}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Effacer la sélection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contrat avec sélection multiple */}
              <div className="dropdown-wrapper-search">
                <button
                  className="dropdown-toggle-search"
                  onClick={() => {
                    setShowContractDropdown(prev => !prev);
                    setShowSectorDropdown(false);
                  }}
                >
                  Contrat <FaChevronDown />
                </button>
                {showContractDropdown && (
                  <div className="dropdown-menu-search">
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                      <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Types de contrats</strong>
                    </div>
                    {getUniqueContractTypes().map(type => (
                      <label key={type} className="dropdown-item-search">
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={selectedContractTypes.includes(type)}
                            onChange={() => toggleValue(selectedContractTypes, type, setSelectedContractTypes)}
                            style={{ marginRight: '12px' }}
                          />
                          <span style={{ flex: 1 }}>{type}</span>
                        </div>
                      </label>
                    ))}
                    {selectedContractTypes.length > 0 && (
                      <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                        <button
                          onClick={() => setSelectedContractTypes([])}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Effacer la sélection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="search-btn-search">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des offres */}
        {getVisibleOffers().length === 0 ? (
          <div className="no-offers">
            <p>Aucune offre ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="organizer-offers-grid">
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
      </div>

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