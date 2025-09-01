import React from 'react';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaUser,
  FaCalendar,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaInfoCircle
} from 'react-icons/fa';
import { MdLocationOn, MdBusiness, MdPerson, MdInfo } from 'react-icons/md';
import '../../pages/styles/forum/ForumOffer.css';
import LogoCompany from '../../assets/Logo-FTT.png';

const OfferDetailPopup = ({ offer, isOpen, onClose }) => {
  console.log('OfferDetailPopup props:', { offer, isOpen });
  if (!isOpen || !offer) return null;

  const getLogoURL = (logo) => {
    if (!logo) return LogoCompany;
    if (typeof logo === 'string') {
      return logo.startsWith('http') ? logo : `${process.env.REACT_APP_API_BASE_URL}${logo}`;
    }
    return LogoCompany;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="offer-detail-popup" onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', borderRadius: '10px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-title">Détails de l'offre</h2>
          <button className="popup-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="offer-detail-content">
          {/* Company Info */}
          <div className="offer-detail-company">
            <div className="company-logo-container">
              <img
                src={getLogoURL(offer.company?.logo)}
                alt={offer.company?.name}
                className="company-logo-large"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = LogoCompany;
                }}
              />
            </div>
            <div className="company-info-main">
              <h3 className="company-name-large">{offer.company?.name}</h3>
              <div className="company-meta-grid">
                {offer.sector && (
                  <div className="company-meta-item">
                    <MdBusiness />
                    <span>Secteur : {offer.sector}</span>
                  </div>
                )}
                {offer.company?.website && (
                  <div className="company-meta-item">
                    <FaGlobe />
                    <a href={offer.company.website} target="_blank" rel="noopener noreferrer">
                      {offer.company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="offer-detail-sections">
            {/* Basic Info */}
            <div className="offer-detail-section">
              <h4 className="section-title">
                <FaBriefcase className="section-icon" />
                Informations du poste
              </h4>
              <div className="section-content">
                <h3 className="offer-title-large">{offer.title}</h3>
                <p className="offer-description-large">{offer.description}</p>
                
                <div className="offer-meta-grid">
                  {offer.location && (
                    <div className="offer-meta-item">
                      <MdLocationOn className="offer-meta-icon" />
                      <span className="offer-meta-text">{offer.location}</span>
                    </div>
                  )}
                  {offer.contract_type && (
                    <div className="offer-meta-item">
                      <FaBriefcase className="offer-meta-icon" />
                      <span className="offer-meta-text">
                        <strong>Type :</strong> {offer.contract_type}
                      </span>
                    </div>
                  )}
                  {offer.created_at && (
                    <div className="offer-meta-item">
                      <FaCalendar className="offer-meta-icon" />
                      <span className="offer-meta-text">
                        Publiée le {formatDate(offer.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Recherché */}
            {offer.profile_recherche && (
              <div className="offer-detail-section">
                <h4 className="section-title">
                  <FaUserTie className="section-icon" />
                  Profil recherché
                </h4>
                <div className="section-content">
                  <div className="profile-recherche-content">
                    <p className="profile-recherche-text">{offer.profile_recherche}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recruiter Info */}
            {offer.recruiter && (
              <div className="offer-detail-section">
                <h4 className="section-title">
                  <MdPerson className="section-icon" />
                  Contact recruteur
                </h4>
                <div className="section-content">
                  <div className="recruiter-info">
                    <div className="recruiter-name">
                      {offer.recruiter.first_name} {offer.recruiter.last_name}
                    </div>
                    {offer.recruiter.email && (
                      <div className="recruiter-contact">
                        <FaEnvelope className="contact-icon" />
                        <a href={`mailto:${offer.recruiter.email}`}>
                          {offer.recruiter.email}
                        </a>
                      </div>
                    )}
                    {offer.recruiter.phone && (
                      <div className="recruiter-contact">
                        <FaPhone className="contact-icon" />
                        <a href={`tel:${offer.recruiter.phone}`}>
                          {offer.recruiter.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPopup; 