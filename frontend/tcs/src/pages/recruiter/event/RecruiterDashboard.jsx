import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubMenu from './SubMenu';
import Navbar from '../../common/NavBar';
import Members from './Members';
import CompanyProfile from '../CompanyProfile';
import ForumInfos from '../../../components/forum/ForumInfos';
import CandidatesList from './CandidatesList'; // Exemple pour la section CVthèque
import { useAuth } from '../../../context/AuthContext';
import RencontresList from './RencontresList'
import OffersList from './OffersList';
import MatchingOffers from './MatchingOffers';
const RecruiterDashboard = () => {
  // Récupère l'objet "forum" depuis l'état de la location (injecté par la navigation)
  const { state } = useLocation();
  const forum = state?.forum;
  const forumId = forum?.id; // On extrait l'id du forum

  const [active, setActive] = useState('infos');
  const [sectionActive, setSectionActive] = useState('preparation');
  const API = process.env.REACT_APP_API_BASE_URL;
  const { accessToken } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="recruiter-dashboard-container">
        {/* Passage de l'objet forum à SubMenu si besoin */}
        <SubMenu
          active={active}
          setActive={setActive}
          sectionActive={sectionActive}
          setSectionActive={setSectionActive}
          forum={forum}
        />
        <div className="recruiter-dashboard-content">
          <div className="dashboard-section">
            {active === 'infos' && <ForumInfos forum={forum} />}
            {active === 'membres' && <Members accessToken={accessToken} apiBaseUrl={API} />}
            {active === 'entreprise' && <CompanyProfile forumId={forumId} accessToken={accessToken} apiBaseUrl={API} />}
            {active === 'cvtheque' && <CandidatesList forumId={forumId} accessToken={accessToken} apiBaseUrl={API} />}
            {active === 'rencontres' && <RencontresList forumId={forumId} accessToken={accessToken} apiBaseUrl={API} />}
            {active === 'offres' && <OffersList forum={forum} accessToken={accessToken} apiBaseUrl={API}/>}
            {active === 'matching' && <MatchingOffers forum={forum} accessToken={accessToken} apiBaseUrl={API}/>}

          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
