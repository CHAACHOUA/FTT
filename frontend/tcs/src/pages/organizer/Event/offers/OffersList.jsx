import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import Navbar from '../../../../components/loyout/NavBar';
import Offer from '../../../../components/card/offer/Offer';
import Loading from '../../../../components/loyout/Loading';
import { Button, Input, Card, Badge } from '../../../../components/common';
import './OffersList.css';
import '../../../../pages/styles/organizer/organizer-buttons.css';
import '../../../../components/filters/offer/SearchBar.css';
import { useAuth } from '../../../../context/AuthContext';
import { getSectorsForSelect, getContractsForSelect } from '../../../../constants/choices';
import axios from 'axios';

const OffersList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const forum = location.state?.forum;
  const forumId = location.state?.forumId;
  const API = process.env.REACT_APP_API_BASE_URL;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [choicesLoading, setChoicesLoading] = useState(true);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [sectorCounts, setSectorCounts] = useState({});
  const [contractCounts, setContractCounts] = useState({});
  const [companyCounts, setCompanyCounts] = useState({});

  // Fonction pour récupérer les offres du forum
  const fetchForumOffers = async () => {
    if (!forumId) {
      setError('ID du forum manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API}/forums/${forumId}/organizer/offers/`, {
        withCredentials: true
      });
      
      const offersData = response.data || [];
      console.log('Offres récupérées pour le forum', forumId, ':', offersData);
      setOffers(offersData);
      setFilteredOffers(offersData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  // Charger les secteurs et contrats depuis les constantes
  useEffect(() => {
    const loadChoices = async () => {
      try {
        setChoicesLoading(true);
        const [sectorsData, contractsData] = await Promise.all([
          getSectorsForSelect(),
          getContractsForSelect()
        ]);
        setSectors(sectorsData);
        setContracts(contractsData);
      } catch (error) {
        console.error('Erreur lors du chargement des choix:', error);
        // Fallback vers des valeurs par défaut
        setSectors([
          { value: 'IT', label: 'Informatique' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'RH', label: 'Ressources Humaines' },
          { value: 'Finance', label: 'Finance' },
          { value: 'Autre', label: 'Autre' },
        ]);
        setContracts([
          { value: 'CDI', label: 'CDI' },
          { value: 'CDD', label: 'CDD' },
          { value: 'Stage', label: 'Stage' },
          { value: 'Alternance', label: 'Alternance' },
        ]);
      } finally {
        setChoicesLoading(false);
      }
    };

    loadChoices();
  }, []);

  // Charger les offres du forum
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && forumId) {
      fetchForumOffers();
    }
  }, [isAuthenticated, isAuthLoading, forumId]);

  // Calculer les compteurs des secteurs, contrats et entreprises
  useEffect(() => {
    const sectorCounts = {};
    const contractCounts = {};
    const companyCounts = {};

    // Initialiser à 0 toutes les options
    sectors.forEach(s => sectorCounts[s.value] = 0);
    contracts.forEach(c => contractCounts[c.value] = 0);
    
    // Initialiser les compteurs d'entreprises
    const companies = [...new Set(offers.map(offer => offer.company.name))];
    companies.forEach(company => companyCounts[company] = 0);

    // Compter dans toutes les offres
    offers.forEach(offer => {
      const sector = offer.sector?.trim();
      const contract = offer.contract_type?.trim();
      const company = offer.company.name;
      
      if (sector && sectorCounts.hasOwnProperty(sector)) {
        sectorCounts[sector]++;
      }
      if (contract && contractCounts.hasOwnProperty(contract)) {
        contractCounts[contract]++;
      }
      if (company && companyCounts.hasOwnProperty(company)) {
        companyCounts[company]++;
      }
    });

    setSectorCounts(sectorCounts);
    setContractCounts(contractCounts);
    setCompanyCounts(companyCounts);
  }, [offers, sectors, contracts]);


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

    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(offer => selectedCompanies.includes(offer.company.name));
    }

    if (selectedSectors.length > 0) {
      filtered = filtered.filter(offer => selectedSectors.includes(offer.sector));
    }

    if (selectedContracts.length > 0) {
      filtered = filtered.filter(offer => selectedContracts.includes(offer.contract_type));
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, selectedCompanies, selectedSectors, selectedContracts]);

  // Récupérer les options uniques pour les filtres
  const companies = useMemo(() => {
    return [...new Set(offers.map(offer => offer.company.name))];
  }, [offers]);

  const toggleValue = (list, value, setter) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  // Gestion du clic sur une offre (navigation gérée par le composant Offer)
  const handleOfferClick = (offer) => {
    console.log('Offer clicked:', offer);
  };

  const handleBack = () => {
    navigate('/event/organizer/dashboard', { 
      state: { 
        forum: forum,
        forumId: forumId,
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

  // Attendre que l'authentification soit vérifiée
  if (isAuthLoading) {
    return (
      <div className="offers-list-container">
        <Navbar />
       
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="offers-list-container">
        <Navbar />
        <div className="error-container">
          <div className="error-message">Vous devez être connecté pour accéder à cette page.</div>
        </div>
      </div>
    );
  }

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
    return <Loading />;
  }

  if (error) {
    return (
      <div className="offers-list-container">
        <Navbar />
        <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Erreur</h3>
          <p>{error}</p>
          <button onClick={fetchForumOffers} className="btn btn-primary">
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
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <FaTimes className="clear-icon-search" onClick={() => setSearchTerm('')} />
            )}

            {/* Entreprises */}
            <div className="dropdown-wrapper-search">
              <button
                className="dropdown-toggle-search"
                onClick={() => {
                  setShowCompanyDropdown(prev => !prev);
                  setShowContractDropdown(false);
                  setShowSectorDropdown(false);
                }}
              >
                Entreprise <FaChevronDown />
                {selectedCompanies.length > 0 && (
                  <Badge type="counter" size="small">{selectedCompanies.length}</Badge>
                )}
              </button>
              {showCompanyDropdown && (
                <div className="dropdown-menu-search">
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                    <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Entreprises</strong>
                  </div>
                  {companies.map(company => (
                    <label key={company} className="dropdown-item-search">
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company)}
                          onChange={() =>
                            toggleValue(selectedCompanies, company, setSelectedCompanies)
                          }
                          style={{ marginRight: '12px' }}
                        />
                        <span style={{ flex: 1 }}>{company}</span>
                      </div>
                      <span className="count-search">{companyCounts[company] || 0}</span>
                    </label>
                  ))}
                  {selectedCompanies.length > 0 && (
                    <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                      <button
                        onClick={() => setSelectedCompanies([])}
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

            {/* Contrats */}
            <div className="dropdown-wrapper-search">
              <button
                className="dropdown-toggle-search"
                onClick={() => {
                  setShowContractDropdown(prev => !prev);
                  setShowSectorDropdown(false);
                  setShowCompanyDropdown(false);
                }}
              >
                Contrat <FaChevronDown />
                {selectedContracts.length > 0 && (
                  <Badge type="counter" size="small">{selectedContracts.length}</Badge>
                )}
              </button>
              {showContractDropdown && (
                <div className="dropdown-menu-search">
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                    <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Types de contrats</strong>
                  </div>
                  {contracts.map(contract => (
                    <label key={contract.value} className="dropdown-item-search">
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={selectedContracts.includes(contract.value)}
                          onChange={() =>
                            toggleValue(selectedContracts, contract.value, setSelectedContracts)
                          }
                          style={{ marginRight: '12px' }}
                        />
                        <span style={{ flex: 1 }}>{contract.label}</span>
                      </div>
                      <span className="count-search">{contractCounts[contract.value] || 0}</span>
                    </label>
                  ))}
                  {selectedContracts.length > 0 && (
                    <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                      <button
                        onClick={() => setSelectedContracts([])}
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

            {/* Secteurs */}
            <div className="dropdown-wrapper-search">
              <button
                className="dropdown-toggle-search"
                onClick={() => {
                  setShowSectorDropdown(prev => !prev);
                  setShowContractDropdown(false);
                  setShowCompanyDropdown(false);
                }}
              >
                Secteur <FaChevronDown />
                {selectedSectors.length > 0 && (
                  <Badge type="counter" size="small">{selectedSectors.length}</Badge>
                )}
              </button>
              {showSectorDropdown && (
                <div className="dropdown-menu-search">
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>
                    <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Secteurs d'activité</strong>
                  </div>
              {sectors.map(sector => (
                    <label key={sector.value} className="dropdown-item-search">
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector.value)}
                          onChange={() =>
                            toggleValue(selectedSectors, sector.value, setSelectedSectors)
                          }
                          style={{ marginRight: '12px' }}
                        />
                        <span style={{ flex: 1 }}>{sector.label}</span>
                      </div>
                      <span className="count-search">{sectorCounts[sector.value] || 0}</span>
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

            <button className="search-btn-search">
              <FaSearch />
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
              .map((offer) => (
                <Offer
                  key={offer.id}
                  offer={offer}
                  onClick={handleOfferClick}
                  space="organizer"
                  forum={forum}
                  activeTab="offres"
                />
              ))}
          </div>
        )}
        </div>

      </div>
    </div>
  );
};

export default OffersList; 