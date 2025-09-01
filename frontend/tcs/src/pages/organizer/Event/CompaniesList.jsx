import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../common/NavBar';
import './CompaniesList.css';
import defaultLogo from '../../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faChevronDown, faChevronRight, faTimes, faPaperPlane, faCheck, faXmark, faToggleOn, faToggleOff, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import InviteRecruiterModal from './InviteRecruiterModal';

const CompaniesList = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log('Location state:', location.state);
  console.log('Props:', props);
  
  const initialCompanies = props.companies || location.state?.companies;
  const accessToken = props.accessToken || location.state?.accessToken;
  const apiBaseUrl = props.apiBaseUrl || location.state?.apiBaseUrl;
  const forum = props.forum || location.state?.forum;
  const forumId = props.forumId || location.state?.forumId || forum?.id;
  
  // État local pour gérer les entreprises avec mise à jour
  const [companies, setCompanies] = useState(initialCompanies || []);
  
  // Mettre à jour l'état local quand les props changent
  useEffect(() => {
    if (initialCompanies) {
      setCompanies(initialCompanies);
    }
  }, [initialCompanies]);
  


  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  if (!companies || !accessToken || !apiBaseUrl) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div className="companies-container">
          <div className="error-message">Erreur : données manquantes pour afficher la liste des entreprises.</div>
        </div>
      </div>
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddRecruiter = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  const handleAddCompany = async () => {
    if (!companyName.trim()) {
      setError("Veuillez entrer le nom de l'entreprise");
      return;
    }

    // Vérifier que le forumId est disponible
    if (!forumId) {
      setError("Erreur : ID du forum non disponible");
      return;
    }
    
    console.log('Forum object:', forum);
    console.log('Forum ID:', forumId);

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Endpoint pour ajouter une entreprise à un forum
      const endpoint = `${apiBaseUrl}/api/companies/forum/`;
      
      const requestBody = {
        name: companyName.trim(),
        forum_id: forumId
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de l\'entreprise');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'ajout de l\'entreprise');
      }

      setShowAddCompanyModal(false);
      setCompanyName('');
      setError(null);
      
      // Rafraîchir automatiquement les données
      await refreshCompaniesData();
      
      // Afficher un message de succès temporaire
      setSuccessMessage("Entreprise ajoutée avec succès !");
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      setError("Erreur lors de l'ajout de l'entreprise: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour rafraîchir les données des entreprises
  const refreshCompaniesData = async () => {
    try {
      console.log('🔄 Rafraîchissement des données des entreprises...');
      
      // Appel API pour récupérer les données du forum mises à jour (incluant les entreprises)
      const response = await fetch(`${apiBaseUrl}/api/forums/${forumId}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const forumData = await response.json();
        console.log('✅ Données du forum mises à jour:', forumData);
        
        // Extraire les entreprises du forum
        if (forumData.companies) {
          setCompanies(forumData.companies);
          console.log('✅ Entreprises mises à jour:', forumData.companies);
        } else {
          console.warn('⚠️ Aucune entreprise trouvée dans les données du forum');
        }
      } else {
        console.error('❌ Erreur lors du rafraîchissement des données');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    }
  };

  const openAddCompanyModal = () => {
    setShowAddCompanyModal(true);
    setCompanyName('');
    setError(null);
  };

  const closeAddCompanyModal = () => {
    setShowAddCompanyModal(false);
    setCompanyName('');
    setError(null);
  };

  // À personnaliser selon ta logique backend
  const handleInvite = (email, company, forum) => {
    // Ici tu peux faire un appel API ou autre
    // Exemple : await api.inviteRecruiter(email, company.id)
    // Pour l'instant, on affiche juste un message dans le modal
    console.log('Invitation envoyée:', { email, company, forum });
  };

  // Fonction pour relancer le recruteur
  const handleResendInvitation = async (recruiter, company) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/auth/invite-recruiter/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          email: recruiter.email,
          company: company,
          forum: forum
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Rafraîchir les données après renvoi d'invitation
        await refreshCompaniesData();
      }
      
      if (response.ok) {
        console.log('Invitation relancée avec succès');
        // Optionnel: afficher un message de succès
      } else if (response.status === 409) {
        console.log('Recruteur déjà invité, invitation relancée');
        // Le recruteur existe déjà, c'est normal pour un relancement
      } else {
        console.error('Erreur lors du relancement de l\'invitation:', data);
      }
    } catch (error) {
      console.error('Erreur lors du relancement de l\'invitation:', error);
    }
  };

  // Fonction pour approuver/désapprouver une entreprise
  const handleToggleApproval = async (company) => {
    try {
      const newApprovedStatus = !company.approved;
      const response = await fetch(`${apiBaseUrl}/api/companies/forum/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          company_id: company.id,
          forum_id: forumId,
          approved: newApprovedStatus
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`Entreprise ${newApprovedStatus ? 'approuvée' : 'désapprouvée'} avec succès`);
        
        // Rafraîchir automatiquement les données
        await refreshCompaniesData();
        
        // Afficher un message de succès temporaire
        setSuccessMessage(`Entreprise ${newApprovedStatus ? 'approuvée' : 'désapprouvée'} avec succès !`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error('Erreur lors du changement de statut:', data);
        setError(data.message || 'Erreur lors du changement de statut de l\'entreprise');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setError('Erreur lors du changement de statut de l\'entreprise');
    }
  };

  // Fonction pour refuser une entreprise (supprimer la relation)
  const handleRejectCompany = async (company) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir refuser ${company.name} ? Cette action supprimera définitivement la relation entre le forum et cette entreprise.`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/companies/forum/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          company_id: company.id,
          forum_id: forumId
        })
      });

      if (response.ok) {
        console.log('Entreprise refusée avec succès');
        
        // Rafraîchir automatiquement les données
        await refreshCompaniesData();
        
        // Afficher un message de succès temporaire
        setSuccessMessage("Entreprise supprimée avec succès !");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const data = await response.json();
        console.error('Erreur lors du refus:', data);
        setError(data.message || 'Erreur lors du refus de l\'entreprise');
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      setError('Erreur lors du refus de l\'entreprise');
    }
  };

  const handleBack = () => {
    navigate('/event/organizer/dashboard', { 
      state: { 
        forum: forum,
        forumId: forumId,
        accessToken: accessToken,
        apiBaseUrl: apiBaseUrl,
        // S'assurer que toutes les données du forum sont passées
        forumData: {
          id: forumId,
          name: forum?.name,
          description: forum?.description,
          start_date: forum?.start_date,
          end_date: forum?.end_date
        }
      }
    });
  };

  // Filtrer les entreprises selon le statut et la recherche
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    
    if (filter === 'approved') {
      matchesFilter = company.approved === true;
    } else if (filter === 'pending') {
      matchesFilter = company.approved === false;
    }
    // Pour 'all', matchesFilter reste true
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ paddingTop: '80px' }}>
      <Navbar />
      <div className="companies-container">
        <div className="companies-header">
          <button onClick={handleBack} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </button>
          <div className="header-content">
            <h1>Entreprises participantes</h1>
            <p>Gérez les entreprises participant à votre forum</p>
          </div>
        </div>

        <div className="companies-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approuvées
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            En attente
          </button>
        </div>

        {/* Header avec recherche et bouton ajouter */}
        <div className="companies-dashboard-header">
          <div className="companies-dashboard-search">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-search-bar"
            />
          </div>
          <button
            className="add-company-button"
            onClick={openAddCompanyModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            Ajouter une entreprise
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Liste des entreprises */}
        <div className="companies-dashboard-list">
          {filteredCompanies.length === 0 ? (
            <div className="no-companies">
              <p>Aucune entreprise trouvée</p>
            </div>
          ) : (
            filteredCompanies.map((company, index) => (
              <div key={index} className="company-dashboard-card">
                <div className="company-header">
                  <FontAwesomeIcon
                    icon={expandedIndex === index ? faChevronDown : faChevronRight}
                    className="toggle-icon"
                    onClick={() => toggleExpand(index)}
                  />
                  <img
                    src={company.logo || defaultLogo}
                    alt={company.name}
                    className="company-logo"
                  />
                  <div className="company-details">
                    <h3 className="company-name">{company.name}</h3>
                    <div className="company-stats-row">
                      <span className="company-badge offers-badge">{company.offers?.length || 0} Offre(s)</span>
                      <span className="company-badge recruiters-badge">{company.recruiters?.length || 0} Recruteur(s)</span>
                      <span className={`company-badge status-badge ${company.approved ? 'approved' : 'pending'}`}>
                        {company.approved ? 'Approuvée' : 'En attente'}
                      </span>
                      {company.added_at && (
                        <span className="company-badge date-badge">{company.added_at}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="company-actions">
                    <button
                      className={`toggle-approval-button ${company.approved ? 'approved' : 'pending'}`}
                      title={company.approved ? 'Désapprouver l\'entreprise' : 'Approuver l\'entreprise'}
                      onClick={() => handleToggleApproval(company)}
                    >
                      <FontAwesomeIcon icon={company.approved ? faToggleOn : faToggleOff} />
                    </button>
                    <button
                      className="reject-company-button"
                      title="Supprimer l'entreprise du forum"
                      onClick={() => handleRejectCompany(company)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                    {company.approved && (
                      <button
                        className="add-recruiter-button"
                        title="Ajouter un recruteur"
                        onClick={() => handleAddRecruiter(company)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste des recruteurs */}
                {expandedIndex === index && (
                  <div className="recruiters-list">
                    {(!company.recruiters || company.recruiters.length === 0) ? (
                      <p className="no-recruiter">Aucun recruteur</p>
                    ) : (
                      <ul>
                        {company.recruiters.map((recruiter, idx) => (
                          <li key={idx} className="recruiter-item">
                            <span className="recruiter-avatar">
                              {recruiter.avatar ? (
                                <img src={recruiter.avatar} alt={recruiter.first_name} />
                              ) : (
                                <span className="recruiter-initials">
                                  {recruiter.first_name?.[0] || ''}{recruiter.last_name?.[0] || ''}
                                </span>
                              )}
                            </span>
                            <span className="recruiter-info">
                              <span className="recruiter-name">{recruiter.first_name} {recruiter.last_name}</span>
                              <span className="recruiter-email">{recruiter.email}</span>
                            </span>
                            <button
                              className="resend-invitation-button"
                              title="Relancer l'invitation"
                              onClick={() => handleResendInvitation(recruiter, company)}
                            >
                              <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal d'invitation */}
        <InviteRecruiterModal
          open={modalOpen}
          onClose={handleCloseModal}
          onInvite={handleInvite}
          company={selectedCompany}
          forum={forum}
          accessToken={accessToken}
          apiBaseUrl={apiBaseUrl}
          onRecruiterAdded={refreshCompaniesData}
        />

        {/* Modal pour ajouter une entreprise */}
        {showAddCompanyModal && (
          <div className="modal-overlay" onClick={closeAddCompanyModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeAddCompanyModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="modal-illustration">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 className="modal-title">Ajouter une entreprise</h2>
              <p className="modal-subtitle">
                Ajouter une nouvelle entreprise
              </p>

              <form className="invite-form" onSubmit={(e) => { e.preventDefault(); handleAddCompany(); }}>
                <div className="invite-input-group">
                  <div className="invite-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 21V7L13 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 21V11L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="invite-input"
                    placeholder="Nom de l'entreprise"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="invite-status error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`invite-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !companyName.trim()}
                >
                  {isSubmitting ? 'Ajout en cours...' : 'Ajouter l\'entreprise'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesList;