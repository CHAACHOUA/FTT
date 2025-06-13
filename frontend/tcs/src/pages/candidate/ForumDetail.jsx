import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ForumRegistrationPopup from '../../components/forum/ForumRegistrationPopup';
import ForumInfos from '../../components/forum/ForumInfos';
import ForumCompanies from '../../components/forum/ForumCompanies';
import '../../pages/styles/forum/ForumDetail.css';
import Navbar from '../common/NavBar';
import Logo from '../../assets/Logo-FTT.png';
import Photo from '../../assets/forum-base.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faBuilding, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const ForumDetail = () => {
  const { state } = useLocation();
  const forum = state?.forum;

  const [activeTab, setActiveTab] = useState('general');
  const [open, setOpen] = useState(false);

  if (!forum) return <p>Forum introuvable.</p>;

  const forumPhoto = Photo;
  const logo = forum.organizer?.logo || Logo;

  return (
    <div>
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
              onRegister={() => setOpen(true)}
              showRegisterButton={true}
            />
          )}

          {activeTab === 'companies' && (
            <ForumCompanies companies={forum.companies} />
          )}

          {activeTab === 'offers' && (
            <div className="forum-detail-offers">
              <p>Veuillez vous inscrire au forum pour accéder aux offres disponibles.</p>
              <button className="btn-seekube btn-filled" onClick={() => setOpen(true)}>S'inscrire</button>
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
