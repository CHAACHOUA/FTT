import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../../pages/styles/recruiter/CompanyRecruiter.css';
import InviteRecruiterModal from '../../../organizer/Event/companies/InviteRecruiterModal';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Loading from '../../../../components/loyout/Loading';

function Members({ accessToken, apiBaseUrl }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    photo: null
  });
  
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
          axios.get(`${apiBaseUrl}/recruiters/recruiters/company-recruiters/`, {
            withCredentials: true,
            params: { forum_id: forum?.id }
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
      console.log('Click outside detected:', {
        selectedRecruiter,
        isEditModalOpen,
        target: event.target,
        closestActionsDropdown: event.target.closest('.actions-dropdown'),
        closestActionsMenu: event.target.closest('.actions-menu'),
        closestModalOverlay: event.target.closest('.modal-overlay'),
        closestModalContent: event.target.closest('.modal-content')
      });
      
      if (selectedRecruiter && 
          !event.target.closest('.actions-dropdown') && 
          !event.target.closest('.actions-menu') &&
          !event.target.closest('.modal-overlay') &&
          !event.target.closest('.modal-content') &&
          !isEditModalOpen) {
        console.log('Setting selectedRecruiter to null due to click outside');
        setSelectedRecruiter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRecruiter, isEditModalOpen]);

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
      console.log('Update account for:', recruiter);
      console.log('Current selectedRecruiter before setting:', selectedRecruiter);
      
      // Pré-remplir le formulaire avec les données du recruteur
      setEditFormData({
        first_name: recruiter.first_name || '',
        last_name: recruiter.last_name || '',
        title: recruiter.title || '',
        photo: recruiter.photo || null
      });
      
      // Garder le recruteur sélectionné pour la sauvegarde
      setSelectedRecruiter(recruiter);
      console.log('Set selectedRecruiter to:', recruiter);
      
      // Ouvrir le modal
      setIsEditModalOpen(true);
      console.log('Modal opened, selectedRecruiter should be:', recruiter);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteAccount = async (recruiter) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${recruiter.first_name || recruiter.email} ?`)) {
      try {
        console.log('Delete account for:', recruiter);
        
        // Appel API pour supprimer le recruteur
        const response = await axios.delete(
          `${apiBaseUrl}/recruiters/recruiters/${recruiter.id}/delete/`,
          { withCredentials: true }
        );
        
        if (response.status === 204) {
          toast.success('✅ Compte supprimé avec succès');
          // Retirer le recruteur de la liste localement
          setRecruiters(prevRecruiters => 
            prevRecruiters.filter(r => r.id !== recruiter.id)
          );
        }
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        if (error.response?.status === 403) {
          toast.error('❌ Vous n\'êtes pas autorisé à supprimer ce compte');
        } else if (error.response?.status === 400) {
          toast.error(`❌ Erreur: ${error.response.data?.error || 'Impossible de supprimer ce compte'}`);
        } else {
          toast.error('❌ Erreur lors de la suppression du compte');
        }
      }
    }
    setSelectedRecruiter(null);
  };

  // Fonctions pour gérer le modal de modification
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      console.log('=== HANDLE SAVE EDIT ===');
      console.log('selectedRecruiter:', selectedRecruiter);
      console.log('selectedRecruiter type:', typeof selectedRecruiter);
      console.log('selectedRecruiter.id:', selectedRecruiter?.id);
      console.log('Form data:', editFormData);
      
      // Vérifier que selectedRecruiter existe
      if (!selectedRecruiter || !selectedRecruiter.id) {
        console.error('selectedRecruiter is null or missing id:', selectedRecruiter);
        toast.error('❌ Erreur: Aucun recruteur sélectionné');
        return;
      }
      
      // Test de connectivité d'abord
      console.log('Testing connectivity...');
      try {
        const testResponse = await axios.get(`${apiBaseUrl}/recruiters/test/`, {
          withCredentials: true
        });
        console.log('Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.error('Test endpoint failed:', testError);
        toast.error('❌ Erreur de connectivité avec le serveur');
        return;
      }
      
      // Validation des champs obligatoires
      if (!editFormData.first_name.trim() || !editFormData.last_name.trim()) {
        toast.error('❌ Le prénom et le nom sont obligatoires');
        return;
      }
      
      // Préparer les données pour l'API
      const formData = new FormData();
      formData.append('first_name', editFormData.first_name.trim());
      formData.append('last_name', editFormData.last_name.trim());
      formData.append('title', editFormData.title || '');
      
      console.log('Form data values:');
      console.log('- first_name:', editFormData.first_name.trim());
      console.log('- last_name:', editFormData.last_name.trim());
      console.log('- title:', editFormData.title || '');
      
      // Ajouter la photo si elle a été modifiée
      if (editFormData.photo && typeof editFormData.photo !== 'string') {
        console.log('Adding photo to FormData:', editFormData.photo);
        formData.append('profile_picture', editFormData.photo);
      }
      
      // Log des données envoyées
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Appel API pour mettre à jour le recruteur
      console.log('Making API call to:', `${apiBaseUrl}/recruiters/recruiters/${selectedRecruiter.id}/update/`);
      
      const response = await axios.put(
        `${apiBaseUrl}/recruiters/recruiters/${selectedRecruiter.id}/update/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('API Response:', response);
      
      if (response.status === 200) {
        toast.success('✅ Compte modifié avec succès');
        // Mettre à jour la liste des recruteurs localement
        setRecruiters(prevRecruiters => 
          prevRecruiters.map(recruiter => 
            recruiter.id === selectedRecruiter.id 
              ? { ...recruiter, ...response.data }
              : recruiter
          )
        );
      }
      
    } catch (error) {
      console.error('Erreur complète lors de la sauvegarde:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error('❌ Vous n\'êtes pas autorisé à modifier ce compte');
      } else if (error.response?.status === 400) {
        toast.error(`❌ Erreur: ${error.response.data?.error || 'Données invalides'}`);
      } else if (error.response?.status === 401) {
        toast.error('❌ Erreur: Token d\'authentification manquant ou invalide');
      } else if (error.response?.status === 404) {
        toast.error('❌ Erreur: Recruteur non trouvé');
      } else {
        toast.error(`❌ Erreur lors de la sauvegarde: ${error.message}`);
      }
    }
    
    // Fermer le modal
    setIsEditModalOpen(false);
    setSelectedRecruiter(null);
    setEditFormData({
      first_name: '',
      last_name: '',
      title: '',
      photo: null
    });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedRecruiter(null);
    setEditFormData({
      first_name: '',
      last_name: '',
      title: '',
      photo: null
    });
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
                    <th>DERNIÈRE CONNEXION</th>
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
                                : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${recruiter.photo}`} 
                              alt={recruiter.first_name} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="avatar-placeholder" 
                            style={{ display: recruiter.photo ? 'none' : 'flex' }}
                          >
                            {recruiter.first_name?.charAt(0)?.toUpperCase() || 
                             recruiter.last_name?.charAt(0)?.toUpperCase() || 
                             recruiter.email?.charAt(0)?.toUpperCase() || 
                             '?'}
                          </div>
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
                      <td className="last-login">
                        {recruiter.last_login 
                          ? new Date(recruiter.last_login).toLocaleDateString('fr-FR') 
                          : 'Jamais connecté'
                        }
                      </td>
                      <td className="email">
                        {recruiter.email 
                          ? recruiter.email.replace(/d$/, '') // Supprime le 'd' en fin d'email
                          : '-'
                        }
                      </td>
                      <td className="offers-count">
                        {recruiter.forum_offers_count || 0}
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
              <div className="action-item" onClick={() => { handleResendInvitation(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                Renvoyer l'invitation
              </div>
              <div className="action-item" onClick={() => { handleUpdateAccount(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                Modifier le compte
              </div>
              <div className="action-item delete-action" onClick={() => { handleDeleteAccount(selectedRecruiter); }} style={{ display: 'block', padding: '12px 16px', cursor: 'pointer', color: '#dc2626' }}>
                Supprimer le compte
              </div>
            </div>
          )}

          {/* Modal de modification de compte */}
          {isEditModalOpen && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="modal-content" style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}>
                <div className="modal-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                    Modifier le compte
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                      Photo de profil
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {editFormData.photo ? (
                          <img
                            src={typeof editFormData.photo === 'string' ? editFormData.photo : URL.createObjectURL(editFormData.photo)}
                            alt="Photo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem', color: '#6b7280' }}>
                            {editFormData.first_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={editFormData.first_name}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={editFormData.last_name}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                      Civilité
                    </label>
                    <select
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Madame">Madame</option>
                      <option value="Monsieur">Monsieur</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>


                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
    </CompanyApprovalCheck>
  );
}

export default Members;
