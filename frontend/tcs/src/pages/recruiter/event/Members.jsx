import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/recruiter/CompanyRecruiter.css';
import recruiter_photo from '../../../assets/recruiter.jpg';
import InviteRecruiterModal from '../../organizer/Event/InviteRecruiterModal';

function Members({ accessToken, apiBaseUrl }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Récupérer les données du forum et de l'entreprise depuis le contexte
  const { state } = useLocation();
  const forum = state?.forum;
  const [company, setCompany] = useState(null);

  // Récupérer les informations de l'entreprise du recruteur connecté
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/companies/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCompany(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des infos entreprise:', err);
      }
    };
    
    if (accessToken) {
      fetchCompanyInfo();
    }
  }, [accessToken, apiBaseUrl]);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/recruiters/company-recruiters/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRecruiters(response.data);
        console.log(response.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, [accessToken, apiBaseUrl]);

  const handleInviteSuccess = () => {
    // Recharger la liste des recruteurs après une invitation réussie
    window.location.reload();
  };

  return (
    <div className="company-recruiters-section">
      <div className="company-recruiters-header">
        <h2 className="company-recruiters-title">Vos recruteurs</h2>
        <button 
          className="invite-recruiter-btn"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Inviter un recruteur
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && !recruiters.length && <p>Aucun recruteur trouvé.</p>}

      <div className="recruiters-grid">
        {recruiters.map((r) => (
          <div key={r.id} className="recruiter-card">
         <img
  src={r.profile_picture ? `${apiBaseUrl}${r.profile_picture}` : recruiter_photo}
  alt={`${r.first_name} ${r.last_name}`}
  className="recruiter-photo"
/>
            <p className="recruiter-name">
              {r.first_name} {r.last_name}
            </p>
          </div>
        ))}
      </div>

      <InviteRecruiterModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteSuccess}
        accessToken={accessToken}
        apiBaseUrl={apiBaseUrl}
        company={company}
        forum={forum}
      />
    </div>
  );
}

export default Members;
