import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ForumRegistrationPopup from '../../components/forum/ForumRegistrationPopup';
import ForumInfos from '../../components/forum/ForumInfos';
import ForumCompanies from '../../components/forum/ForumCompanies';
import '../../pages/styles/forum/ForumDetail.css';
import Navbar from '../common/NavBar';
import Logo from '../../assets/Logo-FTT.png';
import Photo from '../../assets/forum-base.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faBuilding, faBriefcase, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ForumDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const forum = state?.forum;
  const API = process.env.REACT_APP_API_BASE_URL;

  // Debug: Log forum data
  console.log(' [FRONTEND] ForumDetail - state:', state);
  console.log(' [FRONTEND] ForumDetail - forum:', forum);
  console.log(' [FRONTEND] ForumDetail - forum.id:', forum?.id);

  const [activeTab, setActiveTab] = useState('general');
  const [open, setOpen] = useState(false);

  if (!forum) return <p>Forum introuvable.</p>;

  const handleBack = () => {
    navigate('/forums');
  };

  // Fonction pour construire l'URL du logo
  const getLogoURL = (logo) => {
    if (!logo) return Logo; // Retourne le logo par défaut
    if (typeof logo === 'string') {
      if (logo.startsWith('http')) return logo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      return `${mediaBaseUrl}${logo}`;
    }
    return Logo;
  };

  // Fonction pour construire l'URL de la photo du forum
  const getForumPhotoURL = (photo) => {
    if (!photo) return Photo; // Retourne l'image par défaut
    if (typeof photo === 'string') {
      if (photo.startsWith('http')) return photo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      return `${mediaBaseUrl}${photo}`;
    }
    return Photo;
  };

  const forumPhoto = getForumPhotoURL(forum.photo);
  const logo = getLogoURL(forum.organizer?.logo);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div className="forum-detail-card" style={{ marginTop: '100px' }}>
        <div className="banner">
          <img
            src={forumPhoto}
            alt="Bannière du forum"
            className="forum-banner-image"
          />
        </div>

        <div className="card">
          {/* Bouton retour */}
          <button onClick={handleBack} style={{ 
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            zIndex: 1000
          }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Retour aux forums
          </button>

          {/* En-tête */}
          <div className="forum-detail-header">
            <div className="forum-detail-logo">
              <img src={logo} alt={forum.organizer?.name} />
            </div>
            <div>
              <h1 className="forum-detail-title">{forum.name}</h1>
              <p className="forum-detail-organizer">
                Organisé par <strong>{forum.organizer?.name}</strong>
              </p>
            </div>
          </div>

          {/* Onglets */}
          <div className="forum-detail-tabs">
            <div
              className={`forum-detail-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <FontAwesomeIcon icon={faInfoCircle} size="lg" />
              <span>Informations générales</span>
            </div>
            <div
              className={`forum-detail-tab ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveTab('companies')}
            >
              <FontAwesomeIcon icon={faBuilding} size="lg" />
              <span>Entreprises</span>
            </div>
            <div
              className={`forum-detail-tab ${activeTab === 'offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('offers')}
            >
              <FontAwesomeIcon icon={faBriefcase} size="lg" />
              <span>Offres</span>
            </div>
          </div>

          {/* Contenu */}
          {activeTab === 'general' && (
            <ForumInfos
              forum={forum}
              onRegister={() => setOpen(true)}
              showRegisterButton={true}
            />
          )}

          {activeTab === 'companies' && (
            <ForumCompanies companies={forum.companies} />
          )}

          {activeTab === 'offers' && (
            <div className="forum-detail-offers">
           
              <div className="forum-offers-encouragement">
                <div className="forum-offers-encouragement-content">
                  <div className="forum-offers-encouragement-title">
                     Prêt à découvrir les meilleures opportunités ?
                  </div>
                  <div className="forum-offers-encouragement-text">
                    Inscrivez-vous maintenant et accédez à toutes les offres d'emploi disponibles !
                  </div>
                </div>
                
                {/* Bouton d'inscription dans la bannière */}
                <button className="btn-seekube" onClick={() => setOpen(true)}>
                  S'inscrire
                </button>
              </div>
            </div>
          )}

          {/* Popup d'inscription */}
          <ForumRegistrationPopup
            isOpen={open}
            onClose={() => setOpen(false)}
            forumId={forum.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
