import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
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
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  
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

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedRecruiter && !event.target.closest('.actions-dropdown') && !event.target.closest('.actions-menu')) {
        setSelectedRecruiter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRecruiter]);

  const handleInviteSuccess = () => {
    // Recharger la liste des recruteurs après une invitation réussie
    window.location.reload();
  };

  const handleMenuToggle = (recruiter) => {
    console.log('Menu toggle clicked for recruiter:', recruiter);
    console.log('Recruiter ID:', recruiter.id);
    console.log('Current selectedRecruiter:', selectedRecruiter);
    
    // Utiliser l'index ou un autre identifiant unique si l'ID n'existe pas
    const recruiterKey = recruiter.id || recruiter.email || JSON.stringify(recruiter);
    const currentKey = selectedRecruiter?.id || selectedRecruiter?.email || JSON.stringify(selectedRecruiter);
    
    const newSelected = currentKey === recruiterKey ? null : recruiter;
    console.log('Setting selectedRecruiter to:', newSelected);
    setSelectedRecruiter(newSelected);
  };

  // Fonction pour relancer l'invitation d'un recruteur
  const handleResendInvitation = async (recruiter) => {
    try {
      // Vérifier que les données nécessaires sont disponibles
      if (!company) {
        toast.error('Erreur: Données de l\'entreprise non disponibles');
        setSelectedRecruiter(null);
        return;
      }

      console.log('Tentative de relancement invitation pour:', {
        email: recruiter.email,
        company: company,
        forum: forum,
        apiBaseUrl: apiBaseUrl,
        accessToken: accessToken
      });

      // Vérifier les données avant l'envoi
      if (!recruiter.email) {
        toast.error('❌ Erreur: Email du recruteur manquant');
        setSelectedRecruiter(null);
        return;
      }

      // Le token est httpOnly (dans les cookies), pas besoin de le récupérer manuellement
      console.log('Utilisation des cookies httpOnly pour l\'authentification');

      // Envoi de l'invitation en cours...
      toast.info(`Envoi de l'invitation à ${recruiter.email}...`);

      const url = `${apiBaseUrl}/users/auth/invite-recruiter/`;
      const data = {
        email: recruiter.email,
        company: company,
        forum: forum
      };
      const headers = {
        'Content-Type': 'application/json'
        // Pas besoin d'Authorization header car le token est dans les cookies httpOnly
      };

      console.log('URL:', url);
      console.log('Data:', data);
      console.log('Headers:', headers);

      const response = await axios.post(url, data, {
        withCredentials: true,
        headers: headers
      });

      console.log('Réponse du serveur:', response);
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      // Gérer les réponses de succès
      if (response.status === 200 || response.status === 201) {
        // Vérifier si le body contient une erreur malgré le statut 200
        if (response.data && response.data.error) {
          toast.error(`❌ Erreur: ${response.data.error}`);
        } else {
          toast.success(`✅ Invitation envoyée avec succès à ${recruiter.email}`);
          // Pas besoin de recharger, on reste sur la page Membres
        }
      } else if (response.status === 409) {
        toast.success(`✅ Invitation relancée avec succès pour ${recruiter.email}`);
        // Pas besoin de recharger, on reste sur la page Membres
      } else {
        // Gérer les autres codes de statut comme des erreurs
        toast.error(`❌ Erreur lors de l'envoi de l'invitation: ${response.data?.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur complète lors du relancement de l\'invitation:', error);
      
      // Gérer les erreurs réseau et autres exceptions
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status === 409) {
          toast.success(`✅ Invitation relancée avec succès pour ${recruiter.email}`);
          // Pas besoin de recharger, on reste sur la page Membres
        } else if (error.response.status === 400) {
          toast.error(`❌ Erreur: ${error.response.data?.message || 'Données invalides'}`);
        } else if (error.response.status === 401) {
          toast.error(`❌ Erreur: Vous n'êtes pas autorisé à effectuer cette action`);
        } else if (error.response.status === 403) {
          toast.error(`❌ Erreur: Accès refusé pour cette action`);
        } else {
          toast.error(`❌ Erreur serveur: ${error.response.data?.message || 'Erreur inconnue'}`);
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        toast.error(`❌ Erreur réseau: Impossible de contacter le serveur`);
      } else {
        // Quelque chose s'est passé lors de la configuration de la requête
        toast.error(`❌ Erreur: ${error.message}`);
      }
    }
    setSelectedRecruiter(null);
  };

  const handleSwitchRole = async (recruiter) => {
    try {
      // TODO: Implémenter en backend
      console.log('Switch role for:', recruiter);
      toast.info('Fonctionnalité à implémenter en backend');
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      toast.error('Erreur lors du changement de rôle');
    }
    setSelectedRecruiter(null);
  };

  const handleUpdateAccount = async (recruiter) => {
    try {
      // TODO: Implémenter en backend
      console.log('Update account for:', recruiter);
      toast.info('Fonctionnalité à implémenter en backend');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
    setSelectedRecruiter(null);
  };

  const handleDeleteAccount = async (recruiter) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        // TODO: Implémenter en backend
        console.log('Delete account for:', recruiter);
        toast.info('Fonctionnalité à implémenter en backend');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
    setSelectedRecruiter(null);
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

          {/* Tableau des recruteurs */}
          {!error && recruiters.length > 0 && (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>RECRUITERS</th>
                    <th>DATE D'AJOUT</th>
                    <th>EMAIL</th>
                    <th>NOMBRE D'OFFRES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recruiters.map((recruiter) => (
                    <tr key={recruiter.id}>
                      <td className="recruiter-info">
                        <div className="recruiter-avatar">
                          {recruiter.photo ? (
                            <img 
                              src={recruiter.photo.startsWith('http') 
                                ? recruiter.photo 
                                : `${apiBaseUrl}${recruiter.photo}`} 
                              alt={recruiter.first_name} 
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {recruiter.first_name?.charAt(0)?.toUpperCase() || 
                               recruiter.last_name?.charAt(0)?.toUpperCase() || 
                               recruiter.email?.charAt(0)?.toUpperCase() || 
                               '?'}
                            </div>
                          )}
                        </div>
                        <div className="recruiter-details">
                          <div className="recruiter-name">
                            {recruiter.first_name && recruiter.last_name 
                              ? `${recruiter.first_name} ${recruiter.last_name}` 
                              : recruiter.first_name || recruiter.last_name || 'Nom non disponible'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="date-added">
                        {recruiter.created_at 
                          ? new Date(recruiter.created_at).toLocaleDateString('fr-FR') 
                          : 'Date inconnue'
                        }
                      </td>
                      <td className="email">
                        {recruiter.email 
                          ? recruiter.email.replace(/d$/, '') // Supprime le 'd' en fin d'email
                          : '-'
                        }
                      </td>
                      <td className="offers-count">
                        {recruiter.job_offers_count || 0}
                      </td>
                      <td className="actions">
                        <div className="actions-dropdown">
                          <button 
                            className="actions-trigger"
                            onClick={() => handleMenuToggle(recruiter)}
                          >
                            ⋯
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          {/* Menu des actions global */}
          {console.log('Checking if menu should render. selectedRecruiter:', selectedRecruiter)}
          {selectedRecruiter && (
            <div className="actions-menu" 
                 style={{
                   position: 'fixed',
                   top: '100px',
                   right: '50px',
                   zIndex: 10000,
                   background: 'white',
                   border: '2px solid #3b82f6',
                   borderRadius: '8px',
                   boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                   minWidth: '200px',
                   padding: '8px 0'
                 }}>
              {console.log('Rendering menu for:', selectedRecruiter.id)}
              <div className="action-item" onClick={() => { handleSwitchRole(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                Changer de rôle
              </div>
              <div className="action-item delete-action" onClick={() => { handleDeleteAccount(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', color: '#dc2626' }}>
                Supprimer le compte
              </div>
              <div className="action-item" onClick={() => { handleResendInvitation(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                Renvoyer l'invitation
              </div>
              <div className="action-item" onClick={() => { handleUpdateAccount(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer' }}>
                Modifier le compte
              </div>
            </div>
          )}
      </div>
    </div>
    </CompanyApprovalCheck>
  );
}

export default Members;
