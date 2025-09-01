import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers, faArrowLeft, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import ProgrammeManager from './ProgrammeManager';
import SpeakerManager from './SpeakerManager';
import Navbar from '../../common/NavBar';
import './ForumProgrammeManagement.css';

const ForumProgrammeManagement = () => {
  const [activeTab, setActiveTab] = useState('programmes');
  const [forum, setForum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { forumId: urlForumId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;
  
  // Récupérer forumId depuis les paramètres d'URL ou location.state
  const forumId = urlForumId || location.state?.forumId || location.state?.forum?.id;

  // Debug: Log forumId sources
  console.log('🔍 [FRONTEND] ForumProgrammeManagement - urlForumId:', urlForumId);
  console.log('🔍 [FRONTEND] ForumProgrammeManagement - location.state:', location.state);
  console.log('🔍 [FRONTEND] ForumProgrammeManagement - forumId final:', forumId);

  useEffect(() => {
    if (forumId) {
      console.log('🔍 [FRONTEND] ForumProgrammeManagement - Appel fetchForumDetails avec forumId:', forumId);
      fetchForumDetails();
    } else {
      console.log('🔍 [FRONTEND] ForumProgrammeManagement - forumId est undefined, pas d\'appel fetchForumDetails');
    }
  }, [forumId]);

  const fetchForumDetails = async () => {
    try {
      console.log('🔍 [FRONTEND] fetchForumDetails - Début avec forumId:', forumId);
      setIsLoading(true);
      const url = `${API}/api/forums/${forumId}/`;
      console.log('🔍 [FRONTEND] fetchForumDetails - URL:', url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('🔍 [FRONTEND] fetchForumDetails - Réponse reçue:', response.data);
      setForum(response.data);
    } catch (err) {
      console.error('🔍 [FRONTEND] fetchForumDetails - Erreur:', err);
      setError('Erreur lors du chargement des détails du forum');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div className="forum-programme-loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div className="forum-programme-error">
          <p>{error}</p>
          <button onClick={fetchForumDetails}>Réessayer</button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div className="forum-programme-error">
          <p>Forum non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <Navbar />
      
      <div className="forum-programme-container">
        {/* Header avec navigation */}
        <div className="forum-programme-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => window.history.back()}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Retour
            </button>
            <div className="forum-info">
              <h1>{forum.name}</h1>
              <p className="forum-dates">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {forum.start_date} - {forum.end_date}
              </p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'programmes' ? 'active' : ''}`}
              onClick={() => setActiveTab('programmes')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              Programmes
            </button>
            <button
              className={`tab ${activeTab === 'speakers' ? 'active' : ''}`}
              onClick={() => setActiveTab('speakers')}
            >
              <FontAwesomeIcon icon={faUsers} />
              Speakers
            </button>
          </div>
          {activeTab === 'speakers' && (
            <button
              className="external-speakers-btn"
              onClick={() => navigate('/organizer/speakers')}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              Gestion complète des speakers
            </button>
          )}
        </div>

        {/* Contenu des onglets */}
        <div className="tab-content">
          {activeTab === 'programmes' && (
            <ProgrammeManager 
              forumId={forumId} 
              forumName={forum.name}
            />
          )}
          {activeTab === 'speakers' && (
            <SpeakerManager />
          )}
        </div>
        
        {/* Debug: Afficher les valeurs */}
        <div style={{ display: 'none' }}>
          <p>Debug - forumId: {forumId}</p>
          <p>Debug - forum: {forum ? forum.name : 'null'}</p>
          <p>Debug - activeTab: {activeTab}</p>
        </div>
      </div>
    </div>
  );
};

export default ForumProgrammeManagement; 