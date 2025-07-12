import React, { useState } from 'react';
import './CompaniesList.css';
import defaultLogo from '../../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import InviteRecruiterModal from './InviteRecruiterModal';

const CompaniesList = ({ companies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddRecruiter = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  // À personnaliser selon ta logique backend
  const handleInvite = (email, company) => {
    // Ici tu peux faire un appel API ou autre
    // Exemple : await api.inviteRecruiter(email, company.id)
    // Pour l'instant, on affiche juste un message dans le modal
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-dashboard-wrapper">
      {/* Header avec recherche */}
      <div className="companies-dashboard-header">
        <div className="companies-dashboard-search">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-bar"
          />
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="companies-dashboard-list">
        {filteredCompanies.map((company, index) => (
          <div key={index} className="company-dashboard-card">
            <div className="company-header">
              <FontAwesomeIcon
                icon={expandedIndex === index ? faChevronDown : faChevronRight}
                className="toggle-icon"
                onClick={() => toggleExpand(index)}
              />
              <img
                src={company.logo || defaultLogo}
                alt={company.name}
                className="company-logo"
              />
              <div className="company-details">
                <h3 className="company-name">{company.name}</h3>
                <div className="company-stats-row">
                  <span className="company-badge offers-badge">{company.offers.length} Offre(s)</span>
                  <span className="company-badge recruiters-badge">{company.recruiters.length} Recruteur(s)</span>
                  {company.status && (
                    <span className={`company-badge status-badge ${company.status.toLowerCase()}`}>{company.status}</span>
                  )}
                  {company.added_at && (
                    <span className="company-badge date-badge">{company.added_at}</span>
                  )}
                </div>
              </div>
              <button
                className="add-recruiter-button"
                title="Ajouter un recruteur"
                onClick={() => handleAddRecruiter(company)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {/* Liste des recruteurs */}
            {expandedIndex === index && (
              <div className="recruiters-list">
                {company.recruiters.length === 0 ? (
                  <p className="no-recruiter">Aucun recruteur</p>
                ) : (
                  <ul>
                    {company.recruiters.map((recruiter, idx) => (
                      <li key={idx} className="recruiter-item">
                        <span className="recruiter-avatar">
                          {recruiter.avatar ? (
                            <img src={recruiter.avatar} alt={recruiter.first_name} />
                          ) : (
                            <span className="recruiter-initials">
                              {recruiter.first_name?.[0] || ''}{recruiter.last_name?.[0] || ''}
                            </span>
                          )}
                        </span>
                        <span className="recruiter-info">
                          <span className="recruiter-name">{recruiter.first_name} {recruiter.last_name}</span>
                          <span className="recruiter-email">{recruiter.email}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal d'invitation */}
      <InviteRecruiterModal
        open={modalOpen}
        onClose={handleCloseModal}
        onInvite={handleInvite}
        company={selectedCompany}
      />
    </div>
  );
};

export default CompaniesList;