import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/recruiter/CompanyRecruiter.css';
import './CandidateListRecruiter.css';
import recruiter_photo from '../../../assets/recruiter.jpg';
import InviteRecruiterModal from '../../organizer/Event/InviteRecruiterModal';
import CompanyApprovalCheck from '../../../components/CompanyApprovalCheck';

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
    <CompanyApprovalCheck 
      forumId={forum?.id} 
      accessToken={accessToken} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès à la gestion des membres n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="offers-list-wrapper">
        <div className="offers-list-content">
          <div className="company-recruiters-header">
          <h2 className="company-recruiters-title">Vos recruteurs ({recruiters.length} membre{recruiters.length > 1 ? 's' : ''})</h2>
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

      <div className="cards-container">
        {recruiters.map((r) => (
          <div key={r.id} className="candidate-card">
            <div className="candidate-photo">
              <img
                src={r.profile_picture ? `${apiBaseUrl}${r.profile_picture}` : recruiter_photo}
                alt={`${r.first_name} ${r.last_name}`}
              />
            </div>
            <div className="candidate-info">
              <h3>{r.first_name} {r.last_name}</h3>
              <p className="recruiter-email">
                {r.email || 'Email non disponible'}
              </p>
              <p className="recruiter-company">
                {company?.name || 'Entreprise non définie'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bloc informatif */}
      <div className="members-info-block">
        <div className="info-card">
          <h3>Statistiques</h3>
          <p>Total des recruteurs : <strong>{recruiters.length}</strong></p>
          <p>Entreprise : <strong>{company?.name || 'Non définie'}</strong></p>
        </div>
        <div className="info-card">
          <h3>Conseils</h3>
          <p>Invitez vos collègues pour collaborer efficacement sur les forums et gérer les candidatures ensemble.</p>
        </div>
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
    </div>
    </CompanyApprovalCheck>
  );
}

export default Members;
