import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pages/styles/forum/ForumCompany.css';
import '../../components/filters/offer/SearchBar.css';
import logo from '../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CompanyCardPopup from '../card/company/CompanyCardPopup';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import Company from '../card/company/Company';

const ForumCompanies = ({ companies, forum, usePage = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const LogoCompany = logo;
  const sectorDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);

  const ITEMS_PER_PAGE = 9;

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setShowSectorDropdown(false);
      }
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(event.target)) {
        setShowContractDropdown(false);
      }
    };

    if (showSectorDropdown || showContractDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSectorDropdown, showContractDropdown]);

  // Obtenir les secteurs uniques
  const getUniqueSectors = () => {
    const sectors = new Set();
    companies.forEach(company => {
      if (company.sectors && Array.isArray(company.sectors)) {
        company.sectors.forEach(sector => sectors.add(sector));
      }
    });
    return Array.from(sectors).filter(Boolean).sort();
  };

  // Obtenir les types de contrat uniques (depuis les offres des entreprises)
  const getUniqueContractTypes = () => {
    const contractTypes = new Set();
    companies.forEach(company => {
      if (company.offers && Array.isArray(company.offers)) {
        company.offers.forEach(offer => {
          if (offer.contract_type) {
            contractTypes.add(offer.contract_type);
          }
        });
      }
    });
    return Array.from(contractTypes).filter(Boolean).sort();
  };

  // Fonction pour toggle une valeur dans une liste
  const toggleValue = (list, value, setter) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
    setCurrentPage(1); // Retour à la première page lors du changement de filtre
  };

  const filteredCompanies = companies.filter((company) => {
    // Filtrage par recherche
    const matchesSearch = searchTerm === '' ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.sectors && company.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtrage par secteurs (sélection multiple)
    const matchesSectors = selectedSectors.length === 0 ||
      (company.sectors && company.sectors.some(sector => selectedSectors.includes(sector)));

    // Filtrage par types de contrat (sélection multiple)
    // Une entreprise correspond si au moins une de ses offres a le type de contrat sélectionné
    const matchesContracts = selectedContractTypes.length === 0 ||
      (company.offers && company.offers.some(offer => 
        offer.contract_type && selectedContractTypes.includes(offer.contract_type)
      ));

    return matchesSearch && matchesSectors && matchesContracts;
  });

  // Calculer la pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  const handleCompanyClick = (company) => {
    if (usePage && forum) {
      // Rediriger vers la page de détails de l'entreprise (espace candidat)
      navigate(`/candidate/event/company/${company.id}`, {
        state: { 
          company: company,
          forum: forum
        }
      });
    } else {
      // Afficher le popup (page de détails du forum)
      setSelectedCompany(company);
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedCompany(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll vers le haut de la liste
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Retour à la première page lors de la recherche
  };

  return (
    <div className="forum-companies-wrapper">
      {/* Barre de recherche style forum */}
      <div className="search-bar-wrapper-search">
        <div className="search-bar-search">
          <input
            className="search-input-search"
            type="text"
            placeholder="Rechercher une entreprise par nom ou secteur"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <FaTimes className="clear-icon-search" onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }} />
          )}

          {/* Secteur avec sélection multiple */}
          <div className="dropdown-wrapper-search" ref={sectorDropdownRef}>
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
          <div className="dropdown-wrapper-search" ref={contractDropdownRef}>
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
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        {searchTerm && (
          <div className="search-info">
            <span className="search-term-highlight">"{searchTerm}"</span> - {filteredCompanies.length} résultat{filteredCompanies.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Informations sur les résultats */}
      <div className="companies-results-info">
        <p>
          {filteredCompanies.length} entreprise{filteredCompanies.length > 1 ? 's' : ''} trouvée{filteredCompanies.length > 1 ? 's' : ''}
          {totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
        </p>
      </div>

      {/* Liste des entreprises */}
      <div className="forum-detail-companies-list">
        {currentCompanies.map((company, index) => (
          <Company
            key={index}
            company={company}
            onClick={handleCompanyClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="companies-pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Précédent
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Popup pour les détails de l'entreprise */}
      <CompanyCardPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        company={selectedCompany}
      />
    </div>
  );
};

export default ForumCompanies;
