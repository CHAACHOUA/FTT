import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaBriefcase, FaMapMarkerAlt, FaIndustry, FaCalendar, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Navbar from '../../common/NavBar';
import OfferDetailPopup from '../../../components/recruiter/OfferDetailPopup';
import './OffersList.css';
import '../../../pages/styles/organizer/organizer-buttons.css';
import defaultLogo from '../../../assets/Logo-FTT.png';
import forumsBg from '../../../assets/forums-bg.png';

const OffersList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const forum = location.state?.forum;
  const forumId = location.state?.forumId;
  const accessToken = location.state?.accessToken;
  const API = location.state?.apiBaseUrl || process.env.REACT_APP_API_BASE_URL;

  // Extraire les offres des entreprises du forum
  const allOffers = forum?.companies?.flatMap(company =>
    company.offers?.map(offer => ({
      ...offer,
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        logo: company.logo
      },
      recruiter: {
        id: offer.recruiter?.id || offer.recruiter_id || null,
        first_name: offer.recruiter?.recruiter_name || offer.recruiter_name?.split(' ')[0] || 'N/A',
        email: offer.recruiter?.email || offer.recruiter_email || 'N/A',
        phone: offer.recruiter?.phone || offer.recruiter_phone || 'N/A'
      }
    })) || []
  ) || [];

  const [offers, setOffers] = useState(allOffers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredOffers, setFilteredOffers] = useState(allOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferDetailPopupOpen, setIsOfferDetailPopupOpen] = useState(false);

  // Initialiser les offres avec les données du forum
  useEffect(() => {
    if (forum?.companies) {
      const extractedOffers = forum.companies.flatMap(company =>
        company.offers?.map(offer => ({
          ...offer,
          company: {
            id: company.id,
            name: company.name,
            website: company.website,
            logo: company.logo
          },
          recruiter: {
            id: offer.recruiter?.id || offer.recruiter_id || null,
            first_name: offer.recruiter?.first_name || offer.recruiter_name?.split(' ')[0] || 'N/A',
            last_name: offer.recruiter?.last_name || offer.recruiter_name?.split(' ').slice(1).join(' ') || 'N/A',
            email: offer.recruiter?.email || offer.recruiter_email || 'N/A',
            phone: offer.recruiter?.phone || offer.recruiter_phone || 'N/A'
          }
        })) || []
      );
      setOffers(extractedOffers);
      setFilteredOffers(extractedOffers);
    }
  }, [forum]);

  // Filtrage des offres
  useEffect(() => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.recruiter.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.recruiter.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCompany) {
      filtered = filtered.filter(offer => offer.company.name === selectedCompany);
    }

    if (selectedSector) {
      filtered = filtered.filter(offer => offer.sector === selectedSector);
    }

    if (selectedContract) {
      filtered = filtered.filter(offer => offer.contract_type === selectedContract);
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, selectedCompany, selectedSector, selectedContract]);

  // Récupérer les options uniques pour les filtres
  const companies = [...new Set(offers.map(offer => offer.company.name))];
  const sectors = [...new Set(offers.map(offer => offer.sector))];
  const contracts = [...new Set(offers.map(offer => offer.contract_type))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedSector('');
    setSelectedContract('');
  };

  // Ouvre la popup de détails d'offre
  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailPopupOpen(true);
  };

  const handleCloseOfferPopup = () => {
    setIsOfferDetailPopupOpen(false);
    setSelectedOffer(null);
  };

  const handleBack = () => {
    navigate('/event/organizer/dashboard', { 
      state: { 
        forum: forum,
        forumId: forumId,
        accessToken: accessToken,
        apiBaseUrl: API,
        // S'assurer que toutes les données du forum sont passées
        forumData: {
          id: forumId,
          name: forum?.name,
          description: forum?.description,
          start_date: forum?.start_date,
          end_date: forum?.end_date
        }
      }
    });
  };

  if (!forum) {
    return (
      <div className="offers-list-container">
        <Navbar />
        <div className="error-container">
          <div className="error-message">Erreur : données du forum manquantes.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="offers-list-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner">Chargement des offres...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-list-container">
        <Navbar />
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => window.location.reload()} className="retry-button">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="organizer-offers-container" style={{ paddingTop: '80px' }}>
      <Navbar />
      <div className="organizer-offers-content">
        <div className="organizer-header-block">
          <div className="organizer-header-with-forum">
            <button onClick={handleBack} className="organizer-btn-back">
              <FaArrowLeft /> Retour
            </button>
            {forum && (
              <div className="forum-details">
                <h2 className="forum-title">{forum.name}</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{forum.start_date && forum.end_date ? `${forum.start_date} - ${forum.end_date}` : 'Dates non définies'}</span>
                </div>
              </div>
            )}
            {!forum && (
              <div className="forum-details">
                <h2 className="forum-title">Forum non défini</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>Dates non disponibles</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="page-title-section">
          <h1>Liste des Offres</h1>
          <p>Consultez toutes les offres postées par les recruteurs</p>
        </div>
        


        {/* Filtres */}
        <div className="organizer-offers-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="organizer-search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="organizer-filter-select"
            >
              <option value="">Toutes les entreprises</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="organizer-filter-select"
            >
              <option value="">Tous les secteurs</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="organizer-filter-select"
            >
              <option value="">Tous les contrats</option>
              {contracts.map(contract => (
                <option key={contract} value={contract}>{contract}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <button onClick={clearFilters} className="organizer-btn-clear-filters">
              Effacer les filtres
            </button>
          </div>
        </div>



        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <p>Aucune offre ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="organizer-offers-grid">
            {[...filteredOffers]
              .sort((a, b) => {
                const byCompany = a.company.name.localeCompare(b.company.name);
                if (byCompany !== 0) return byCompany;
                return new Date(b.created_at) - new Date(a.created_at);
              })
              .map((offer) => {
                const bannerSrc = offer.company.banner
                  ? (offer.company.banner.startsWith('http') ? offer.company.banner : `${API}${offer.company.banner}`)
                  : forumsBg;
                const recruiterFirst = offer.recruiter?.first_name || '';
                const recruiterLast = offer.recruiter?.last_name || '';
                const initials = `${recruiterFirst?.[0] || ''}${recruiterLast?.[0] || ''}`.toUpperCase() || 'HR';
                return (
                  <div
                    key={offer.id}
                    className="organizer-offer-card horizontal"
                    onClick={() => handleOfferClick(offer)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="offer-left-banner">
                      <img src={bannerSrc} alt="Bannière entreprise" onError={(e)=>{e.target.src = forumsBg;}} />
                      <div className="company-logo-badge">
                        <img
                          src={offer.company.logo ? (offer.company.logo.startsWith('http') ? offer.company.logo : `${API}${offer.company.logo}`) : defaultLogo}
                          alt={offer.company.name}
                          onError={(e)=>{e.target.src = defaultLogo;}}
                        />
                      </div>
                    </div>

                    <div className="offer-right-content">
                      <div className="offer-top-line">
                        <div className="recruiter-avatar">{initials}</div>
                        <div className="recruiter-block">
                          <div className="recruiter-name-line">{recruiterFirst} {recruiterLast} @ {offer.company.name}</div>
                        </div>
                        <span className="offer-date">Publiée le {new Date(offer.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>

                      <h4 className="offer-title large">{offer.title}</h4>
                      
                      {offer.sector && (
                        <div className="offer-sector-line">
                          <FaIndustry />
                          <span>{offer.sector}</span>
                        </div>
                      )}
                      
                      <div className="offer-location-line">
                        <FaMapMarkerAlt />
                        <span>{offer.location || 'Non précisé'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Popup pour les détails de l'offre */}
        {isOfferDetailPopupOpen && selectedOffer && (
          <OfferDetailPopup
            offer={selectedOffer}
            onClose={handleCloseOfferPopup}
          />
        )}
      </div>
    </div>
  );
};

export default OffersList; 