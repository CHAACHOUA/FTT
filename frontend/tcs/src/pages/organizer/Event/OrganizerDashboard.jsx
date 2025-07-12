// OrganizerDashboard.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../common/NavBar';
import SubMenu from './SubMenu';
import CompaniesList from './CompaniesList'; // à créer
import CandidatesList from './CandidatesList'; // déjà utilisé dans recruiter dashboard
import { useAuth } from '../../../context/AuthContext';

const OrganizerDashboard = () => {
  const { state } = useLocation();
  const forum = state?.forum;
  const forumId = forum?.id;
  console.log(forum.companies)

  const [active, setActive] = useState('entreprises');
  const API = process.env.REACT_APP_API_BASE_URL;
  const { accessToken } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="recruiter-dashboard-container">
        <SubMenu active={active} setActive={setActive} />
        <div className="recruiter-dashboard-content">
          <div className="dashboard-section">
            {active === 'entreprises' && (
              <CompaniesList companies={forum.companies} accessToken={accessToken} apiBaseUrl={API} />
            )}
            {active === 'candidats' && (
              <CandidatesList forumId={forumId} accessToken={accessToken} apiBaseUrl={API} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
