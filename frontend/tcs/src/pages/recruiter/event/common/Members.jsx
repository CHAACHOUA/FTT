import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';
import './CandidateListRecruiter.css';
import '../../../organizer/Event/programmes/SpeakerManager.css'; // Import SpeakerManager.css for grid styles
import recruiter_photo from '../../../../assets/recruiter.jpg';
import InviteRecruiterModal from '../../../organizer/Event/companies/InviteRecruiterModal';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import PersonCard from '../../../../components/card/common/PersonCard';
import Loading from '../../../../components/loyout/Loading';

function Members({ accessToken, apiBaseUrl }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Récupérer les données du forum et de l'entreprise depuis le contexte
  const { state } = useLocation();
  const forum = state?.forum;
  const [company, setCompany] = useState(null);

  // Récupérer les informations des membres de l'entreprise avec leurs données complètes
  useEffect(() => {
    const fetchMembersWithCompanyInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Faire les deux requêtes en parallèle
        const [recruitersResponse, companyResponse] = await Promise.all([
          axios.get(`${apiBaseUrl}/recruiters/company-recruiters/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(`${apiBaseUrl}/companies/profile/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        const recruitersData = recruitersResponse.data;
        const companyData = companyResponse.data;

        // Enrichir les données des recruteurs avec les informations de l'entreprise
        const enrichedRecruiters = recruitersData.map(recruiter => ({
          ...recruiter,
          company: { name: companyData.name },
          company_name: companyData.name
        }));

        setRecruiters(enrichedRecruiters);
        setCompany(companyData);

      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des membres');
      } finally {
        setLoading(false);
      }
    };

    fetchMembersWithCompanyInfo();
  }, []); // Tableau de dépendances vide pour n'exécuter qu'une seule fois

  const handleInviteSuccess = () => {
    // Recharger la liste des recruteurs après une invitation réussie
    window.location.reload();
  };

  // Fonction pour relancer l'invitation d'un recruteur
  const handleResendInvitation = async (recruiter) => {
    try {
      // Vérifier que les données nécessaires sont disponibles
      if (!company) {
        console.error('Données de l\'entreprise non disponibles');
        return;
      }

      console.log('Tentative de relancement invitation pour:', {
        email: recruiter.email,
        company: company,
        forum: forum,
        apiBaseUrl: apiBaseUrl
      });

      const response = await axios.post(`${apiBaseUrl}/users/auth/invite-recruiter/`, {
        email: recruiter.email,
        company: company,
        forum: forum
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse du serveur:', response);

      if (response.status === 200) {
        console.log('Invitation relancée avec succès');
        // Recharger la liste des recruteurs
        window.location.reload();
      } else if (response.status === 409) {
        console.log('Recruteur déjà invité, invitation relancée');
        window.location.reload();
      } else {
        console.error('Erreur lors du relancement de l\'invitation:', response.data);
      }
    } catch (error) {
      console.error('Erreur complète lors du relancement de l\'invitation:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.status === 409) {
        window.location.reload();
      }
    }
  };

  // Afficher le loading sur toute la page
  if (loading) {
    return <Loading />;
  }

  return (
    <CompanyApprovalCheck 
      forumId={forum?.id} 
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

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!error && !recruiters.length && <p>Aucun recruteur trouvé.</p>}

          {/* Afficher les recruteurs avec PersonCard */}
          {!error && recruiters.length > 0 && (
            <div className="speakers-grid person-cards-grid">
              {recruiters.map((r) => (
                <PersonCard
                  key={r.id}
                  person={r}
                  type="recruiter"
                  onSend={handleResendInvitation}
                  showActions={true}
                  showSend={true}
                  showContact={false}
                  showView={false}
                />
              ))}
            </div>
          )}

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
