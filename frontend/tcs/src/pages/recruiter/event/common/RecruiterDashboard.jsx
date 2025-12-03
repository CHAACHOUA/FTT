import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SubMenu from './SubMenu';
import Navbar from '../../../../components/loyout/NavBar';
import Members from './Members';
import CompanyProfile from '../../profile/CompanyProfile';

import CandidatesList from './CandidatesList'; // Exemple pour la section CVthèque
import { useAuth } from '../../../../context/AuthContext';
import RencontresList from '../hybrid/RencontresList'
import OffersList from './OffersList';
// Pages virtuelles
import VirtualAgenda from '../virtual/VirtualAgenda';
import VirtualCandidates from '../virtual/VirtualCandidates';
import InterviewBoard from '../../../../components/trello/InterviewBoard';
import RecruiterApplications from '../virtual/RecruiterApplications';
import VirtualDashboard from '../virtual/VirtualDashboard';
import InterviewManagement from '../virtual/InterviewManagement';
import ChatContainer from '../../../../components/chat/ChatContainer';
import '../../../../pages/styles/recruiter/RecruiterDashboard.css';
import '../virtual/InterviewManagement.css';

const RecruiterDashboard = () => {
  // Récupère l'objet "forum" depuis l'état de la location (injecté par la navigation)
  const { state } = useLocation();
  
  // Récupérer le forum depuis state ou sessionStorage
  const getForumFromStorage = () => {
    try {
      const stored = sessionStorage.getItem('recruiter_dashboard_forum');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erreur parsing forum depuis sessionStorage', e);
    }
    return null;
  };

  const forum = state?.forum || getForumFromStorage();
  const forumId = forum?.id; // On extrait l'id du forum
  const openChat = state?.openChat;
  const conversationId = state?.conversationId;

  console.log('🔍 [RecruiterDashboard] State reçu:', { 
    hasForum: !!forum, 
    openChat, 
    conversationId,
    forumType: forum?.type,
    isVirtual: forum?.is_virtual
  });

  const [active, setActive] = useState(() => {
    // Vérifier sessionStorage pour l'active
    const storedActive = sessionStorage.getItem('recruiter_dashboard_active');
    if (storedActive) {
      sessionStorage.removeItem('recruiter_dashboard_active');
      return storedActive;
    }
    
    if (openChat) {
      console.log('🔍 [RecruiterDashboard] Initialisation avec openChat=true, active=virtual-chat');
      return 'virtual-chat';
    }
    const defaultActive = (forum?.type === 'virtuel' || forum?.is_virtual) ? 'virtual-dashboard' : 'offres';
    console.log('🔍 [RecruiterDashboard] Initialisation active:', defaultActive);
    return defaultActive;
  });
  const [sectionActive, setSectionActive] = useState('preparation');

  // Nettoyer sessionStorage après utilisation
  useEffect(() => {
    if (sessionStorage.getItem('recruiter_dashboard_forum')) {
      sessionStorage.removeItem('recruiter_dashboard_forum');
    }
  }, []);

  // Mettre à jour active si openChat change
  useEffect(() => {
    console.log('🔍 [RecruiterDashboard] useEffect openChat:', openChat);
    if (openChat) {
      console.log('🔍 [RecruiterDashboard] Mise à jour active vers virtual-chat');
      setActive('virtual-chat');
    }
  }, [openChat]);
  const API = process.env.REACT_APP_API_BASE_URL;
  const { accessToken } = useAuth();

  // Garde-fou: si on arrive sans forum dans l'état (accès direct à l'URL)
  if (!forum) {
    return (
      <div className="recruiter-dashboard-container">
        <Navbar />
        <div className="recruiter-dashboard-layout" style={{ padding: '120px 24px' }}>
          <p>Forum introuvable. Merci d'accéder au tableau de bord depuis la page du forum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard-container">
      <Navbar />
      <div className="recruiter-dashboard-layout">
        {/* SubMenu à gauche */}
        <div className="recruiter-sidebar">
          <SubMenu
            active={active}
            setActive={setActive}
            sectionActive={sectionActive}
            setSectionActive={setSectionActive}
            forum={forum}
          />
        </div>
        
        {/* Contenu principal à droite */}
        <div className="recruiter-main-content">
          {active === 'membres' && <Members accessToken={accessToken} apiBaseUrl={API} />}
          {active === 'entreprise' && <CompanyProfile forumId={forumId} accessToken={accessToken} apiBaseUrl={API} />}
          {active === 'cvtheque' && <CandidatesList forumId={forumId} apiBaseUrl={API} forum={forum} accessToken={accessToken} />}
          {active === 'rencontres' && <RencontresList forumId={forumId} apiBaseUrl={API} />}
          {active === 'offres' && <OffersList forum={forum} accessToken={accessToken} apiBaseUrl={API}/>}
          
          {/* Pages virtuelles */}
          {active === 'virtual-dashboard' && <VirtualDashboard forum={forum} />}
          {active === 'virtual-agenda' && <VirtualAgenda forum={forum} accessToken={accessToken} apiBaseUrl={API} />}
          {active === 'virtual-candidates' && <RecruiterApplications forumId={forumId} />}
          {active === 'virtual-interviews' && <InterviewManagement forumId={forumId} forum={forum} />}
          {active === 'virtual-chat' && (
            <div className="interview-management-container">
              <div className="interview-management-header">
                <h1>Messages</h1>
                <p>Communiquez avec les candidats</p>
              </div>
              <div className="chat-content-wrapper">
                <ChatContainer forumId={forumId} initialConversationId={conversationId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
