import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchForumDetails();
  }, [forumId]);

  const fetchForumDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/api/forums/${forumId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setForum(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des détails du forum');
      console.error(err);
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
      </div>
    </div>
  );
};

export default ForumProgrammeManagement; 