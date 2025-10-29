import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { useLocation } from 'react-router-dom';
import ForumInfos from '../../../components/forum/ForumInfos';
import ForumCompanies from '../../../components/forum/ForumCompanies';
import '../../pages/styles/forum/ForumDetail.css';
import Navbar from '../common/NavBar';
import Logo from '../../assets/Logo-FTT.png';
import Photo from '../../assets/forum-base.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faBuilding, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
// import { getUserFromToken } from '../../context/decoder-jwt'; // Fichier supprimé

const ForumDetail = () => {
  const { state } = useLocation();
  const forum = state?.forum;
  const API = process.env.REACT_APP_API_BASE_URL;
  const { accessToken, role } = useAuth();

  const [activeTab, setActiveTab] = useState('general');

  if (!forum) return <p>Forum introuvable.</p>;

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
      <div className="forum-detail-card">
        <div className="banner">
          <img
            src={forumPhoto}
            alt="Bannière du forum"
            className="forum-banner-image"
          />
        </div>

        <div className="card">
          {/* En-tête */}
          <div className="forum-detail-header">
            <div className="forum-detail-logo">
              <img src={logo} alt={forum.organizer?.name} />
            </div>
            <div>
              <h1 className="forum-detail-title">{forum.name}</h1>
              <p className="forum-detail-organizer">Organisé par {forum.organizer?.name}</p>
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
              showRegisterButton={false}
            />
          )}

          {activeTab === 'companies' && (
            <ForumCompanies companies={forum.companies} />
          )}

          {activeTab === 'offers' && (
            <div className="forum-detail-offers">
              <p>Consultez les offres disponibles pour ce forum.</p>
              <button 
                className="btn-seekube btn-filled" 
                onClick={() => window.location.href = `/event/recruiter/dashboard`}
              >
                Accéder au dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumDetail; 