import React, { useEffect } from 'react';
import '../../../pages/styles/forum/ForumCompany.css';
import logo from '../../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBuilding, faUsers, faEnvelope, faPhone, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, Badge } from '../../common';

const CompanyCardPopup = ({ isOpen, onClose, company }) => {
  const API = process.env.REACT_APP_API_BASE_URL;

  // Gérer l'effet blur sur toute la page
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('popup-open');
      // Empêcher le scroll de la page
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('popup-open');
      // Restaurer le scroll de la page
      document.body.style.overflow = '';
    }

    // Nettoyer lors du démontage
    return () => {
      document.body.classList.remove('popup-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fonction pour construire l'URL du logo
  const getLogoURL = (logo) => {
    if (!logo) return logo; // Retourne le logo par défaut
    if (typeof logo === 'string') {
      if (logo.startsWith('http')) return logo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      return `${mediaBaseUrl}${logo}`;
    }
    return logo;
  };
  console.log('Company:', company);

  if (!isOpen || !company) return null;

  return (
    <div className="company-card-popup-overlay" onClick={onClose}>
      <div className="company-card-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Détails de l'entreprise</h2>
          <button className="popup-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="company-card-content">
          {/* Premier bloc : Logo, nom, secteur, site web, total recruteurs */}
          <div className="company-card-header">
            <div className="company-logo-container">
              <img
                src={getLogoURL(company.logo) || logo}
                alt={company.name}
                className="company-logo-large"
              />
            </div>
            <div className="company-info-main">
              <h3 className="company-name-large">{company.name}</h3>
              <div className="company-meta-grid">
                {company.sectors && company.sectors.length > 0 && (
                  <div className="company-meta-item">
                    <FontAwesomeIcon icon={faBuilding} />
                    <span>Secteur : {company.sectors.join(', ')}</span>
                  </div>
                )}
                {company.website && (
                  <div className="company-meta-item">
                    <FontAwesomeIcon icon={faGlobe} />
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  </div>
                )}
                <div className="company-meta-item">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{company.recruiters.length} recruteur{company.recruiters.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="company-details">
            {company.description && (
              <div className="company-section">
                <h4 className="company-section-title">Description</h4>
                <p className="company-description">{company.description}</p>
              </div>
            )}
           

            {company.website && (
              <div className="company-section">
                <h4>Site web</h4>
                <p>
                  <FontAwesomeIcon icon={faGlobe} />
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    {company.website}
                  </a>
                </p>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCardPopup; 