import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendar,
  FaHeart,
  FaRegHeart,
  FaLocationArrow,
  FaEdit,
  FaTrash,
  FaUsers,
  FaFlag,
  FaClock,
  FaFileAlt,
} from 'react-icons/fa';
import { MdBusiness, MdLocationOn } from 'react-icons/md';
import LogoCompany from '../../../assets/Logo-FTT.png';
import './Offer.css';

const Offer = ({ 
  offer, 
  onClick, 
  onToggleFavorite,
  onShare,
  onEdit,
  onDelete,
  onMatching,
  space = 'candidate', // 'candidate', 'organizer', 'recruiter', 'matching'
  isFavorite = false,
  isMatchingInProgress = false,
  className = '',
  forum = null, // Données du forum pour la navigation
  activeTab = 'offres' // Onglet actif pour la navigation
}) => {
  const navigate = useNavigate();
  // Gestion des URLs d'images
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Utiliser REACT_APP_API_BASE_URL_MEDIA pour les fichiers média
    const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
    return mediaBaseUrl + url;
  };

  // Données de l'offre avec fallbacks
  const offerData = {
    id: offer.id,
    title: offer.title || 'Titre non défini',
    description: offer.description || '',
    location: offer.location || 'Non précisé',
    sector: offer.sector || offer.sectors?.[0] || '',
    contract_type: offer.contract_type || '',
    status: offer.status,
    status_display: offer.status_display,
    start_date: offer.start_date || '',
    experience_required: offer.experience_required || '1-3',
    experience_display: offer.experience_display || '1-3 ans',
    created_at: offer.created_at || new Date().toISOString(),
    // Données de l'entreprise
    company: {
      id: offer.company?.id || offer.company_id,
      name: offer.company?.name || offer.company_name || offer.companyName || 'Entreprise non définie',
      logo: offer.company?.logo || offer.company_logo || offer.logo,
      banner: offer.company?.banner || offer.company_banner,
      website: offer.company?.website || offer.company_website
    },
    // Données du recruteur
    recruiter: {
      id: offer.recruiter?.id || offer.recruiter_id,
      name: offer.recruiter?.name || offer.recruiter_name || 'Recruteur',
      photo: offer.recruiter?.photo || offer.recruiter_photo,
      email: offer.recruiter?.email || offer.recruiter_email,
      phone: offer.recruiter?.phone || offer.recruiter_phone
    }
  };

  // Génération des initiales du recruteur
  const getInitials = (name) => {
    if (!name) return 'R';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return '#28a745'; // Vert
      case 'draft':
        return '#ffc107'; // Jaune
      case 'expired':
        return '#dc3545'; // Rouge
      default:
        return '#6c757d'; // Gris
    }
  };

  // URLs des images
  const logoSrc = offerData.company.logo
    ? getFullUrl(offerData.company.logo)
    : LogoCompany;

  const handleCardClick = () => {
    // Pour les espaces qui ne doivent pas naviguer (matching, company)
    if (space === 'matching' || space === 'company') {
      if (onClick) {
        onClick(offer);
      }
      return;
    }
    
    // Navigation vers la page de détails d'offre (sécurisé)
    navigate('/offer/detail', {
      state: {
        offer: offer,
        isFavorite: isFavorite,
        space: space,
        forum: forum,
        activeTab: activeTab
      }
    });
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(offerData.id);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare(offer);
    } else {
      // Partage par défaut
      if (navigator.share) {
        navigator.share({
          title: offerData.title,
          text: `Découvrez cette offre d'emploi : ${offerData.title} chez ${offerData.company.name}`,
          url: window.location.href
        });
      } else {
        // Fallback : copier le lien
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
      }
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(offer);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(offer.id);
    }
  };

  const handleApplyClick = () => {
    navigate('/forums/event/application', { 
      state: { 
        offer: offerData, 
        forum: forum 
      } 
    });
  };

  // Déterminer quels boutons afficher selon l'espace
  const getActionButtons = () => {
    switch (space) {
      case 'candidate':
        return (
          <div className="forum-offer-actions">
            <button
              className="forum-offer-action-button"
              onClick={handleFavoriteClick}
              title="Ajouter aux favoris"
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button 
              className="forum-offer-action-button" 
              title="Voir les détails"
              onClick={handleShareClick}
            >
              <FaLocationArrow />
            </button>
            {/* Bouton Postuler pour les forums virtuels */}
            {forum && (forum.type === 'virtuel' || forum.is_virtual) && (
              <button 
                className="forum-offer-action-button apply-button" 
                title="Postuler à cette offre"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleApplyClick();
                }}
              >
                <FaFileAlt />
              </button>
            )}
          </div>
        );
      case 'organizer':
        return null; // Pas de boutons d'action pour l'organizer
      case 'recruiter':
        return (
          <div className="forum-offer-actions">
            {onEdit && (
              <button
                className="forum-offer-action-button"
                onClick={handleEditClick}
                title="Modifier l'offre"
              >
                <FaEdit />
              </button>
            )}
            {onDelete && (
              <button
                className="forum-offer-action-button"
                onClick={handleDeleteClick}
                title="Supprimer l'offre"
              >
                <FaTrash />
              </button>
            )}
          </div>
        );
      case 'matching':
        return (
          <div className="forum-offer-actions">
            <button
              className="forum-offer-action-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMatching) {
                  onMatching();
                }
              }}
              disabled={isMatchingInProgress}
              title="Matching candidat"
            >
              {isMatchingInProgress ? (
                <span>...</span>
              ) : (
                <FaUsers />
              )}
            </button>
          </div>
        );
      case 'company':
        return null; // Pas de boutons d'action pour l'affichage entreprise
      default:
        return null;
    }
  };

  return (
    <div 
      className={`forum-offer-card ${className}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Section Logo et Entreprise */}
      <div className="forum-offer-company-section">
        <img
          src={logoSrc}
          alt={offerData.company.name}
          className="forum-offer-logo"
          onError={(e) => { e.target.src = LogoCompany; }}
        />
        <div className="forum-offer-company-info">
          <h4 className="forum-offer-company-name">
            {offerData.company.name}
          </h4>
          <div className="forum-offer-company-meta">
            <MdBusiness className="forum-offer-meta-icon" />
            <span>{offerData.sector || 'Secteur non précisé'}</span>
          </div>
        </div>
      </div>

      {/* Section Contenu Principal */}
      <div className="forum-offer-content">
        <h3 className="forum-offer-title">{offerData.title}</h3>
        <p className="forum-offer-description">{offerData.description}</p>
        
        {/* Métadonnées avec icônes */}
        <div className="forum-offer-meta">
          {offerData.location && (
            <div className="forum-offer-meta-item">
              <MdLocationOn className="forum-offer-meta-icon" />
              <span className="forum-meta-text">{offerData.location}</span>
            </div>
          )}
          {offerData.contract_type && (
            <div className="forum-offer-meta-item">
              <FaBriefcase className="forum-offer-meta-icon" />
              <span className="forum-meta-text">
                <strong>Type :</strong> {offerData.contract_type}
              </span>
            </div>
          )}
          {offerData.experience_display && (
            <div className="forum-offer-meta-item">
              <FaClock className="forum-offer-meta-icon" />
              <span className="forum-meta-text">
                <strong>Expérience :</strong> {offerData.experience_display}
              </span>
            </div>
          )}
          {offerData.start_date && (
            <div className="forum-offer-meta-item">
              <FaCalendar className="forum-offer-meta-icon" />
              <span className="forum-meta-text">
                <strong>Début :</strong> {new Date(offerData.start_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {offerData.status && offerData.status_display && (space === 'organizer' || space === 'recruiter') && (
            <div className="forum-offer-meta-item">
              <FaFlag 
                className="forum-offer-meta-icon" 
                style={{ color: getStatusColor(offerData.status) }}
              />
              <span 
                className="forum-meta-text"
                style={{ color: getStatusColor(offerData.status), fontWeight: 'bold' }}
              >
                {offerData.status_display}
              </span>
            </div>
          )}
        </div>

        {/* Section Recruteur */}
        <div className="forum-offer-recruiter-section">
          {offerData.recruiter.photo ? (
            <img 
              src={offerData.recruiter.photo} 
              alt={offerData.recruiter.name}
              className="forum-offer-recruiter-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="forum-offer-recruiter-initials"
            style={{ 
              display: offerData.recruiter.photo ? 'none' : 'flex',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4f2cc6',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {getInitials(offerData.recruiter.name)}
          </div>
          <div className="forum-offer-recruiter-info">
            <div className="forum-offer-recruiter-name">
              {offerData.recruiter.name}
            </div>
            <div className="forum-offer-recruiter-role">
              Recruteur • {offerData.company.name}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {getActionButtons()}

    </div>
  );
};

export default Offer;
