import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import SpeakerManager from './SpeakerManager';
import Navbar from '../../../../components/loyout/NavBar';
import './SpeakerManagementPage.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const SpeakerManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: '70px' }}>
      <Navbar />
      
      <div className="speaker-management-page">
        {/* Header avec navigation */}
        <div className="speaker-management-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Retour
            </button>
            <div className="page-info">
              <h1>Gestion des Speakers</h1>
              <p>Ajoutez et gérez les speakers pour vos forums</p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="speaker-management-content">
          <SpeakerManager />
        </div>
      </div>
    </div>
  );
};

export default SpeakerManagementPage; 