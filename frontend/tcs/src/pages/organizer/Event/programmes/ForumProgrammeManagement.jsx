import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../../../context/AuthContext';
import ProgrammeManager from './ProgrammeManager';
import SpeakerManager from './SpeakerManager';
import { Button, Input, Card, Badge } from '../../../../components/common';
import Navbar from '../../../../components/loyout/NavBar';
import Loading from '../../../../components/loyout/Loading';
import './ForumProgrammeManagement.css';
import '../../../../pages/styles/organizer/organizer-buttons.css';

const ForumProgrammeManagement = () => {
  const [activeTab, setActiveTab] = useState('programmes');
  const [forum, setForum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;
  
  // Récupérer forumId depuis location.state
  const forumId = location.state?.forumId || location.state?.forum?.id;

  // Debug: Log forumId sources
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
      const url = `${API}/forums/${forumId}/`;
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

  const handleBack = () => {
    // Retour vers la page précédente
    window.history.back();
  };

  if (isLoading) {
    return <Loading />;
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
      
      <div className="forum-programme-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header avec navigation */}
        <div className="organizer-header-block">
          <div className="organizer-header-with-forum">
            <button onClick={handleBack} className="organizer-btn-back">
              <FaArrowLeft /> Retour
            </button>
            <div className="forum-details">
              <h2 className="forum-title">{forum.name}</h2>
              <div className="forum-date-range">
                <FaCalendarAlt className="calendar-icon" />
                <span>{forum.start_date && forum.end_date ? `${forum.start_date} - ${forum.end_date}` : 'Dates non définies'}</span>
              </div>
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
         </div>

         {/* Section titre de page */}
         <div className="page-title-section" style={{ margin: '32px 0' }}>
           <h1 style={{ marginBottom: '0.5rem' }}>Gestion des programmes</h1>
           <p style={{ margin: '0' }}>Gérez les programmes de votre forum</p>
         </div>

        {/* Contenu des onglets */}
        <div className="tab-content">
          {activeTab === 'programmes' && (
            <ProgrammeManager 
              forumId={forumId} 
              forumName={forum.name}
              forumDates={{
                start_date: forum.start_date,
                end_date: forum.end_date
              }}
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