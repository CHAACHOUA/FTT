import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubMenu from './SubMenu';
import Navbar from '../../../../components/loyout/NavBar';
import Members from './Members';
import CompanyProfile from '../../profile/CompanyProfile';

import CandidatesList from './CandidatesList'; // Exemple pour la section CVthèque
import { useAuth } from '../../../../context/AuthContext';
import RencontresList from '../hybrid/RencontresList'
import OffersList from './OffersList';
import MatchingOffers from './MatchingOffers';
// Pages virtuelles
import VirtualAgenda from '../virtual/VirtualAgenda';
import VirtualCandidates from '../virtual/VirtualCandidates';
import VirtualInterviews from '../virtual/VirtualInterviews';
import RecruiterApplications from '../virtual/RecruiterApplications';
import '../../../../pages/styles/recruiter/RecruiterDashboard.css';

const RecruiterDashboard = () => {
  // Récupère l'objet "forum" depuis l'état de la location (injecté par la navigation)
  const { state } = useLocation();
  const forum = state?.forum;
  const forumId = forum?.id; // On extrait l'id du forum

  const [active, setActive] = useState('offres');
  const [sectionActive, setSectionActive] = useState('preparation');
  const API = process.env.REACT_APP_API_BASE_URL;
  const { accessToken } = useAuth();

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
          {active === 'cvtheque' && <CandidatesList forumId={forumId} apiBaseUrl={API} />}
          {active === 'rencontres' && <RencontresList forumId={forumId} apiBaseUrl={API} />}
          {active === 'offres' && <OffersList forum={forum} accessToken={accessToken} apiBaseUrl={API}/>}
          {active === 'matching' && <MatchingOffers forum={forum} accessToken={accessToken} apiBaseUrl={API}/>}
          
          {/* Pages virtuelles */}
          {active === 'virtual-agenda' && <VirtualAgenda forum={forum} accessToken={accessToken} apiBaseUrl={API} />}
          {active === 'virtual-candidates' && <RecruiterApplications forumId={forumId} />}
          {active === 'virtual-interviews' && <VirtualInterviews forum={forum} accessToken={accessToken} apiBaseUrl={API} />}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
