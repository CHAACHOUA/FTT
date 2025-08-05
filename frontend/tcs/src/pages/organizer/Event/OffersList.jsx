import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaBriefcase, FaMapMarkerAlt, FaIndustry, FaCalendar } from 'react-icons/fa';
import Navbar from '../../common/NavBar';
import './OffersList.css';
import defaultLogo from '../../../assets/Logo-FTT.png';

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
    <div className="offers-list-container">
      <Navbar />
      <div className="offers-list-content">
        <div className="offers-list-header">
          <h1>Liste des Offres</h1>
          <p>Consultez toutes les offres postées par les recruteurs</p>
        </div>

        {/* Filtres */}
        <div className="offers-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="filter-select"
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
              className="filter-select"
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
              className="filter-select"
            >
              <option value="">Tous les contrats</option>
              {contracts.map(contract => (
                <option key={contract} value={contract}>{contract}</option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Effacer les filtres
          </button>
        </div>



        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <p>Aucune offre ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="offers-grid">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <div className="offer-company">
                    <img
                      src={offer.company.logo ? (offer.company.logo.startsWith('http') ? offer.company.logo : `${API}${offer.company.logo}`) : defaultLogo}
                      alt={offer.company.name}
                      className="company-logo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultLogo;
                      }}
                    />
                    <div className="company-info">
                      <h3 className="company-name">{offer.company.name}</h3>
                      <p className="recruiter-name">
                        {offer.recruiter.first_name !== 'N/A' && offer.recruiter.last_name !== 'N/A' 
                          ? `${offer.recruiter.first_name} ${offer.recruiter.last_name}`
                          : 'Recruteur non spécifié'
                        }
                      </p>
                    </div>
                  </div>
                  <span className="offer-date">
                    Publiée le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="offer-content">
                  <h4 className="offer-title">{offer.title}</h4>
                  <p className="offer-description">{offer.description}</p>
                </div>

                <div className="offer-details">
                  <div className="detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{offer.location || 'Non précisé'}</span>
                  </div>
                  <div className="detail-item">
                    <FaIndustry className="detail-icon" />
                    <span>{offer.sector}</span>
                  </div>
                  <div className="detail-item">
                    <FaBriefcase className="detail-icon" />
                    <span>{offer.contract_type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersList; 