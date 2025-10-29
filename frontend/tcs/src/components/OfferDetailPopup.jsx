import React, { useEffect } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { FaTimes, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaFileAlt, FaSearch, FaStar, FaClock, FaCheckCircle } from 'react-icons/fa';
import './OfferDetailPopup.css';

const OfferDetailPopup = ({ offer, onClose }) => {
  // Animation d'entrée
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!offer) return null;

  return (
    <div className="offer-popup-overlay" onClick={onClose}>
      <div className="offer-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="offer-popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="offer-popup-header">
          <h2 className="offer-title">{offer.title}</h2>
          <div className="offer-company">
            <FaBuilding className="icon" />
            <span>{offer.company?.name || 'Entreprise non spécifiée'}</span>
          </div>
        </div>

        <div className="offer-popup-body">
          {/* Informations principales */}
          <div className="offer-section">
            <h3>
              <FaStar className="icon" />
              Informations principales
            </h3>
            <div className="offer-info-grid">
              <div className="info-item">
                <FaMapMarkerAlt className="icon" />
                <span><strong>Localisation :</strong> {offer.location || 'Non spécifiée'}</span>
              </div>
              <div className="info-item">
                <FaCalendarAlt className="icon" />
                <span><strong>Type de contrat :</strong> {offer.contract_type || 'Non spécifié'}</span>
              </div>
              <div className="info-item">
                <FaUser className="icon" />
                <span><strong>Secteur :</strong> {offer.sector || 'Non spécifié'}</span>
              </div>
              {offer.salary && (
                <div className="info-item">
                  <FaFileAlt className="icon" />
                  <span><strong>Salaire :</strong> {offer.salary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <div className="offer-section">
              <h3>
                <FaFileAlt className="icon" />
                Description du poste
              </h3>
              <div className="offer-description">
                {offer.description}
              </div>
            </div>
          )}

          {/* Profil recherché (texte libre provenant de l'offre) */}
          {offer.profile_recherche && (
            <div className="offer-section">
              <h3>
                <FaSearch className="icon" />
                Profil recherché
              </h3>
              <div className="offer-description">
                {offer.profile_recherche}
              </div>
            </div>
          )}

          {/* Profil recherché */}
          {offer.profile_search && (
            <div className="offer-section">
              <h3>
                <FaSearch className="icon" />
                Profil recherché
              </h3>
              <div className="profile-search-details">
                {offer.profile_search.contract_type && (
                  <div className="profile-item">
                    <strong>Type de contrat :</strong>
                    <span>{Array.isArray(offer.profile_search.contract_type) 
                      ? offer.profile_search.contract_type.join(', ') 
                      : offer.profile_search.contract_type}</span>
                  </div>
                )}
                
                {offer.profile_search.sector && (
                  <div className="profile-item">
                    <strong>Secteur :</strong>
                    <span>{Array.isArray(offer.profile_search.sector) 
                      ? offer.profile_search.sector.join(', ') 
                      : offer.profile_search.sector}</span>
                  </div>
                )}
                
                {offer.profile_search.experience && (
                  <div className="profile-item">
                    <strong>Expérience :</strong>
                    <span>{offer.profile_search.experience} ans</span>
                  </div>
                )}
                
                {offer.profile_search.region && (
                  <div className="profile-item">
                    <strong>Région :</strong>
                    <span>{offer.profile_search.region}</span>
                  </div>
                )}
                
                {offer.profile_search.rqth && (
                  <div className="profile-item">
                    <strong>RQTH :</strong>
                    <span>{offer.profile_search.rqth ? 'Oui' : 'Non'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compétences requises */}
          {offer.required_skills && offer.required_skills.length > 0 && (
            <div className="offer-section">
              <h3>
                <FaCheckCircle className="icon" />
                Compétences requises
              </h3>
              <div className="skills-list">
                {offer.required_skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="offer-section">
            <h3>
              <FaClock className="icon" />
              Informations supplémentaires
            </h3>
            <div className="additional-info">
              {offer.created_at && (
                <div className="info-item">
                  <strong>Date de création :</strong>
                  <span>{new Date(offer.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              
              {offer.updated_at && (
                <div className="info-item">
                  <strong>Dernière mise à jour :</strong>
                  <span>{new Date(offer.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="offer-popup-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPopup; 