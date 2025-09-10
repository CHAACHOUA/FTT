import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaBriefcase, FaIndustry, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import '../../styles/recruiter/OffersList.css';
import OfferModal from './OfferModal';
import OfferDetailPopup from '../../../components/recruiter/OfferDetailPopup';
import CompanyApprovalCheck from '../../../components/CompanyApprovalCheck';
import logoFTT from '../../../assets/Logo-FTT.png';

const OffersList = ({ forum, accessToken, apiBaseUrl }) => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferDetailPopupOpen, setIsOfferDetailPopupOpen] = useState(false);

  const forum_id = forum.id;

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return apiBaseUrl.replace(/\/$/, '') + url;
  };

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

  // Récupération des offres liées au forum
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-offers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { forum_id },
        });
        setOffers(response.data);
        setFilteredOffers(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement des offres');
      } finally {
        setLoading(false);
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

  // Ouvre modal pour ajout
  const onAddOffer = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };

  // Ouvre modal pour modification
  const onUpdateOffer = (offer) => {
    setEditingOffer(offer);
    setModalOpen(true);
  };

  // Supprime une offre
  const onDeleteOffer = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/recruiters/offers/${id}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOffers((prev) => prev.filter((offer) => offer.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
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

  // Envoie les données du formulaire au backend (create ou update)
  const handleSubmit = async (formData) => {
    try {
      if (editingOffer) {
        const response = await axios.put(
          `${apiBaseUrl}/api/recruiters/offers/${editingOffer.id}/update/`,
          { ...formData, forum_id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setOffers((prev) =>
          prev.map((offer) => (offer.id === editingOffer.id ? response.data : offer))
        );
      } else {
        const response = await axios.post(
          `${apiBaseUrl}/api/recruiters/offers/create/`,
          { ...formData, forum_id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setOffers((prev) => [response.data, ...prev]);
      }
      setModalOpen(false);
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <p>Chargement des offres...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <CompanyApprovalCheck 
      forumId={forum.id} 
      accessToken={accessToken} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'ajout d'offres n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
          <div className="page-title-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1>Liste des Offres</h1>
                <p>Gérez toutes vos offres d'emploi</p>
              </div>
              <button className="btn-add-offer" onClick={onAddOffer}>
                <FaPlus /> Ajouter une offre
              </button>
            </div>
          </div>

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

        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
          <div className="no-offers">
            <p>{offers.length === 0 ? 'Aucune offre trouvée.' : 'Aucune offre ne correspond aux critères de recherche.'}</p>
          </div>
        ) : (
          <div className="offers-grid offers-list-horizontal">
            {filteredOffers.map((offer) => {
              const recruiterFirst = offer.recruiter_name?.split(' ')[0] || '';
              const recruiterLast = offer.recruiter_name?.split(' ')[1] || '';
              const initials = `${recruiterFirst?.[0] || ''}${recruiterLast?.[0] || ''}`.toUpperCase() || 'HR';
              const bannerSrc = offer.company_banner 
                ? getFullUrl(offer.company_banner) 
                : (offer.company_logo ? getFullUrl(offer.company_logo) : logoFTT);
              
              return (
                <div
                  key={offer.id}
                  className="offer-card horizontal"
                  onClick={() => handleOfferClick(offer)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="offer-left-banner">
                    <img src={bannerSrc} alt="Bannière entreprise" onError={(e) => {e.target.src = logoFTT;}} />
                    <div className="company-logo-badge">
                      <img
                        src={offer.company_logo ? getFullUrl(offer.company_logo) : logoFTT}
                        alt={offer.company_name}
                        onError={(e) => {e.target.src = logoFTT;}}
                      />
                    </div>
                  </div>

                  <div className="offer-right-content">
                    <div className="offer-top-line">
                      <div className="recruiter-avatar">{initials}</div>
                      <div className="recruiter-block">
                        <div className="recruiter-name-line">{offer.recruiter_name} @ {offer.company_name}</div>
                      </div>
                      <span className="offer-date">Publiée le {new Date(offer.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <h4 className="offer-title large">{offer.title}</h4>
                    
                    <div className="offer-meta-tags">
                      {offer.sector && (
                        <div className="offer-meta-tag sector">
                          <FaIndustry />
                          <span>{offer.sector}</span>
                        </div>
                      )}
                      {offer.contract_type && (
                        <div className="offer-meta-tag contract">
                          <FaBriefcase />
                          <span>{offer.contract_type}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="offer-location-line">
                      <FaMapMarkerAlt />
                      <span>{offer.location || 'Non précisé'}</span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="offer-actions">
                    <button 
                      className="btn-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOffer(offer);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOffer(offer.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <OfferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingOffer}
        forumId={forum_id}
      />

      {/* Popup pour les détails de l'offre */}
      {isOfferDetailPopupOpen && selectedOffer && (
        <OfferDetailPopup
          offer={selectedOffer}
          onClose={handleCloseOfferPopup}
        />
      )}
    </div>
    </CompanyApprovalCheck>
  );
};

export default OffersList;
