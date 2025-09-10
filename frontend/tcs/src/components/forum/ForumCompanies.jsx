import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pages/styles/forum/ForumCompany.css';
import logo from '../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CompanyCardPopup from './CompanyCardPopup';
import { FaTimes } from 'react-icons/fa';

const ForumCompanies = ({ companies, forum, usePage = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const LogoCompany = logo;

  const ITEMS_PER_PAGE = 9;

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div 
            key={index} 
            className="forum-detail-company-card"
            onClick={() => handleCompanyClick(company)}
            style={{ cursor: 'pointer' }}
          >
            <div className="forum-detail-company-logo-container">
              <img
                src={company.logo || LogoCompany}
                alt={company.name}
                className="forum-detail-company-logo"
              />
            </div>
            <div className="forum-detail-company-info">
              <h3 className="forum-detail-company-name">{company.name}</h3>
              
              {/* Secteur d'activité */}
              <div className="forum-detail-company-sectors">
                {company.sectors && company.sectors.length > 0 
                  ? company.sectors.map((sector, index) => (
                      <span key={index} className="forum-detail-company-sector">
                        {sector}
                      </span>
                    ))
                  : company.sector || company.activity_sector 
                    ? <span className="forum-detail-company-sector">{company.sector || company.activity_sector}</span>
                    : <span className="forum-detail-company-sector">Secteur non spécifié</span>
                }
              </div>
              
              {/* Total recruteurs */}
              <div className="forum-detail-company-recruiters">
                <strong>{company.recruiters.length}</strong> recruteur
                {company.recruiters.length > 1 ? 's' : ''}
              </div>
              
              {/* Description (2 lignes) */}
              {company.description && (
                <p className="forum-detail-company-description">
                  {company.description.length > 120 
                    ? company.description.substring(0, 120) + '...' 
                    : company.description
                  }
                </p>
              )}
            </div>
          </div>
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
