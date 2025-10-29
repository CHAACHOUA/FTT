import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import '../../../../pages/styles/recruiter/OffersList.css';
import '../../../../pages/styles/recruiter/Matching.css';
import Loading from '../../../../components/loyout/Loading';
import { useNavigate } from 'react-router-dom';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Offer from '../../../../components/card/offer/Offer';
import { Button, Input, Card, Badge } from '../../../../components/common';

const MatchingOffers = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [matchingInProgressForOffer, setMatchingInProgressForOffer] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState('');

  const navigate = useNavigate();
  const forum_id = forum.id;


  // Obtenir les options uniques pour les filtres
  const getUniqueSectors = () => {
    const sectors = new Set();
    offers.forEach(offer => {
      if (offer.sectors) {
        offer.sectors.forEach(sector => sectors.add(sector));
      }
    });
    return Array.from(sectors).sort();
  };

  const getUniqueContractTypes = () => {
    const contractTypes = new Set();
    offers.forEach(offer => {
      if (offer.contract_type) {
        contractTypes.add(offer.contract_type);
      }
    });
    return Array.from(contractTypes).sort();
  };

  const getUniqueRecruiters = () => {
    const recruiters = new Set();
    offers.forEach(offer => {
      if (offer.recruiter_name) {
        recruiters.add(offer.recruiter_name);
      }
    });
    return Array.from(recruiters).sort();
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSelectedContractType('');
    setSelectedRecruiter('');
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true);
        const response = await axios.get(`${apiBaseUrl}/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        console.log('Offers data:', response.data); // Debug pour voir la structure
        setOffers(response.data);
        setFilteredOffers(response.data);
        setErrorOffers(null);
      } catch (err) {
        setErrorOffers(err.response?.data?.detail || 'Erreur lors du chargement des offres');
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, [accessToken, apiBaseUrl, forum_id]);

  // Filtrage des offres
  useEffect(() => {
    let filtered = offers;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par secteur
    if (selectedSector) {
      filtered = filtered.filter(offer =>
        offer.sectors?.some(sector => sector === selectedSector)
      );
    }

    // Filtre par type de contrat
    if (selectedContractType) {
      filtered = filtered.filter(offer =>
        offer.contract_type === selectedContractType
      );
    }

    // Filtre par recruteur
    if (selectedRecruiter) {
      filtered = filtered.filter(offer =>
        offer.recruiter_name === selectedRecruiter
      );
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, selectedSector, selectedContractType, selectedRecruiter]);

  const handleStartMatching = async (offerId) => {
    setMatchingInProgressForOffer(offerId);

    try {
      const res = await axios.post(
        `${apiBaseUrl}/matching/start/${offerId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const candidates = res.data.candidates || [];
      const offer = offers.find(o => o.id === offerId);
      
      // Navigation vers la page de détails de matching
      navigate('/matching/detail', {
        state: {
          offer: offer,
          candidates: candidates,
          forum: forum,
          activeTab: 'matching',
          space: 'recruiter'
        }
      });

    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du matching');
    } finally {
      setMatchingInProgressForOffer(null);
    }
  };

  if (matchingInProgressForOffer) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum.id} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès au matching n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
        {loadingOffers && <Loading />}
        {errorOffers && <div className="error">{errorOffers}</div>}
        {!loadingOffers && offers.length === 0 && <p>Aucune offre disponible.</p>}

        {/* Filtres et recherche */}
        <div className="filters-section">
          <div className="search-bar">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par titre, description ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                  title="Effacer la recherche"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Secteur</label>
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
              <label>Type de contrat</label>
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

            <div className="filter-group">
              <label>Recruteur</label>
              <select
                value={selectedRecruiter}
                onChange={(e) => setSelectedRecruiter(e.target.value)}
                className="filter-select"
              >
                <option value="">Tous les recruteurs</option>
                {getUniqueRecruiters().map(recruiter => (
                  <option key={recruiter} value={recruiter}>{recruiter}</option>
                ))}
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="reset-filters-btn"
              title="Réinitialiser tous les filtres"
            >
              <FaFilter /> Réinitialiser
            </button>
          </div>

          {/* Compteur de résultats */}
          <div className="results-count">
            <span>
              {filteredOffers.length} offre{filteredOffers.length !== 1 ? 's' : ''} trouvée{filteredOffers.length !== 1 ? 's' : ''}
              {offers.length !== filteredOffers.length && ` sur ${offers.length}`}
            </span>
          </div>
        </div>

        {/* Loader global pendant matching (optionnel) */}
        {matchingInProgressForOffer && (
          <div className="global-loading-overlay">
            <Loading />
          </div>
        )}

        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <p>{offers.length === 0 ? 'Aucune offre trouvée.' : 'Aucune offre ne correspond aux critères de recherche.'}</p>
          </div>
        ) : (
          <div className="offers-grid offers-list-horizontal">
            {filteredOffers.map((offer) => (
              <Offer
                key={offer.id}
                offer={offer}
                onClick={() => {}} // Pas de popup de détails dans matching
                onMatching={() => handleStartMatching(offer.id)}
                space="matching"
                isMatchingInProgress={matchingInProgressForOffer === offer.id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
    </CompanyApprovalCheck>
  );
};

export default MatchingOffers;