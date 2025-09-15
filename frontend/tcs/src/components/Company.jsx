import React from 'react';
import './Company.css';
import logo from '../assets/Logo-FTT.png';
import banner from '../assets/banner.jpg';

const Company = ({ 
  company, 
  onClick,
  className = ''
}) => {

  // Traitement des données de l'entreprise avec fallbacks
  const companyData = {
    id: company?.id || null,
    name: company?.name || 'Entreprise non spécifiée',
    logo: company?.logo || null,
    sectors: company?.sectors || (company?.sector ? [company.sector] : []) || (company?.activity_sector ? [company.activity_sector] : []),
    description: company?.description || '',
    recruiters: company?.recruiters || [],
    website: company?.website || null,
    email: company?.email || null,
    phone: company?.phone || null,
    address: company?.address || null
  };


  const handleCardClick = () => {
    if (onClick) {
      onClick(companyData);
    }
  };

  return (
    <div 
      className={`forum-detail-company-card ${className}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Bannière de l'entreprise */}
      <div className="forum-detail-company-banner">
        <img
          src={companyData.banner || banner}
          alt={`Bannière ${companyData.name}`}
          className="forum-detail-company-banner-img"
          onError={(e) => {
            e.target.src = banner;
          }}
        />
      </div>
      
      <div className="forum-detail-company-logo-container">
        <img
          src={companyData.logo || logo}
          alt={companyData.name}
          className="forum-detail-company-logo"
          onError={(e) => {
            e.target.src = logo;
          }}
        />
      </div>
      
      <div className="forum-detail-company-info">
        <h3 className="forum-detail-company-name">
          {companyData.name}
        </h3>
        
        {/* Secteurs d'activité */}
        <div className="forum-detail-company-sectors">
          {(() => {
            // Logique pour déterminer les secteurs à afficher
            let sectorsToShow = [];
            
            if (company?.sectors && Array.isArray(company.sectors) && company.sectors.length > 0) {
              sectorsToShow = company.sectors;
            } else if (company?.sector) {
              sectorsToShow = [company.sector];
            } else if (company?.activity_sector) {
              sectorsToShow = [company.activity_sector];
            }
            
            if (sectorsToShow.length > 0) {
              return sectorsToShow.map((sector, index) => (
                <span key={index} className="forum-detail-company-sector">
                  {sector}
                </span>
              ));
            } else {
              return <span className="forum-detail-company-sector">Secteur non spécifié</span>;
            }
          })()}
        </div>
        
        {/* Total recruteurs */}
        <div className="forum-detail-company-recruiters">
          <strong>{companyData.recruiters.length}</strong> recruteur
          {companyData.recruiters.length > 1 ? 's' : ''}
        </div>
        
        {/* Description (2 lignes) */}
        {companyData.description && (
          <p className="forum-detail-company-description">
            {companyData.description.length > 120 
              ? companyData.description.substring(0, 120) + '...' 
              : companyData.description
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default Company;
