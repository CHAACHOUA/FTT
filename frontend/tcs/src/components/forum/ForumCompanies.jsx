import React, { useState } from 'react';
import '../../pages/styles/forum/ForumCompany.css';
import logo from '../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const ForumCompanies = ({ companies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const LogoCompany = logo;

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="forum-companies-wrapper">
      {/* Barre de recherche */}
      <div className="search-bar-container">
        <div className="search-bar-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="forum-detail-companies-list">
        {filteredCompanies.map((company, index) => (
          <div key={index} className="forum-detail-company-card">
            <div className="forum-detail-company-logo-container">
              <img
                src={company.logo || LogoCompany}
                alt={company.name}
                className="forum-detail-company-logo"
              />
            </div>
            <div className="forum-detail-company-info">
              <h3 className="forum-detail-company-name">{company.name}</h3>
              <p className="forum-detail-company-recruiters">
                {company.recruiters.length} recruteur
                {company.recruiters.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumCompanies;
