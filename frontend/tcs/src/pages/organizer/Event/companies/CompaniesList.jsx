import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../../../components/loyout/NavBar';
import Loading from '../../../../components/loyout/Loading';
import './CompaniesList.css';
import defaultLogo from '../../../../assets/Logo-FTT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faChevronDown, faChevronRight, faTimes, faPaperPlane, faXmark, faToggleOn, faToggleOff, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import InviteRecruiterModal from './InviteRecruiterModal';
import PersonCard from '../../../../components/card/common/PersonCard';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

const CompaniesList = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, accessToken } = useAuth();
  console.log('Location state:', location.state);
  console.log('Props:', props);
  
  const initialCompanies = props.companies || location.state?.companies;
  const apiBaseUrl = props.apiBaseUrl || location.state?.apiBaseUrl;
  const forum = props.forum || location.state?.forum;
  const forumId = props.forumId || location.state?.forumId || forum?.id;
  
  // État local pour gérer les entreprises avec mise à jour
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  


  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  // Fonction pour charger les entreprises du forum
  const fetchForumCompanies = async () => {
    if (!forumId) {
      setError('ID du forum manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la même logique que OffersList - récupérer les données du forum
      const response = await axios.get(`${apiBaseUrl}/forums/${forumId}/`, {
        withCredentials: true
      });
      
      const forumData = response.data;
      if (forumData && forumData.companies) {
        setCompanies(forumData.companies);
      } else {
        setCompanies([]);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      setError('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  // Charger les entreprises au montage du composant
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && forumId) {
      fetchForumCompanies();
    }
  }, [isAuthenticated, isAuthLoading, forumId, apiBaseUrl]);

  // Attendre que l'authentification soit vérifiée
  if (isAuthLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
       
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!apiBaseUrl) {
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

  const toggleDropdown = (index, event) => {
    if (dropdownOpen === index) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(index);
      
      // Calculer la position du popup après un court délai
      setTimeout(() => {
        if (event && event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          const popup = document.querySelector('.enterprise-options-panel');
          if (popup) {
            popup.style.position = 'fixed';
            popup.style.top = `${rect.bottom + 8}px`;
            popup.style.left = `${rect.right - 200}px`;
            popup.style.zIndex = '99999';
          }
        }
      }, 10);
    }
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

    // Vérifier qu'il n'y a pas déjà une entreprise avec le même nom (insensible à la casse)
    const existingCompany = companies.find(company => 
      company.name.toLowerCase() === companyName.trim().toLowerCase()
    );
    
    if (existingCompany) {
      setError(`Une entreprise avec le nom "${companyName.trim()}" existe déjà dans ce forum`);
      return;
    }
    
    console.log('Forum object:', forum);
    console.log('Forum ID:', forumId);

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Endpoint pour ajouter une entreprise à un forum
      const endpoint = `${apiBaseUrl}/companies/forum/`;
      
      const requestBody = {
        name: companyName.trim(),
        forum_id: forumId
      };
      
      console.log('Request body:', requestBody);
      
      const response = await axios.post(endpoint, requestBody, {
        withCredentials: true
      });

      if (response.status !== 201 || !response.data.success) {
        throw new Error(response.data?.message || 'Erreur lors de l\'ajout de l\'entreprise');
      }

      setShowAddCompanyModal(false);
      setCompanyName('');
      setError(null);
      
      // Afficher un message de succès
      console.log('Entreprise ajoutée avec succès:', response.data.message);
      
      // Recharger la liste des entreprises après ajout
      setTimeout(async () => {
        await refreshCompaniesList();
      }, 1000);
      
      // Optionnel: rafraîchir les données
      if (props.onCompanyAdded) {
        props.onCompanyAdded();
      }
    } catch (err) {
      setError("Erreur lors de l'ajout de l'entreprise: " + err.message);
    } finally {
      setIsSubmitting(false);
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

  // Fonction pour recharger la liste des entreprises
  const refreshCompaniesList = async () => {
    await fetchForumCompanies();
  };

  // Callback appelé après une invitation réussie
  const handleInvite = async (email, company, forum) => {
    console.log('Invitation envoyée:', { email, company, forum });
    // Attendre un peu pour que le backend traite l'invitation
    setTimeout(async () => {
      await refreshCompaniesList();
    }, 1000);
  };

  // Fonction pour relancer le recruteur
  const handleResendInvitation = async (recruiter, company) => {
    try {
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
        await refreshCompaniesList();
      } else if (response.status === 409) {
        console.log('Recruteur déjà invité, invitation relancée');
        await refreshCompaniesList();
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
        await refreshCompaniesList();
      }
    }
  };

  // Fonction pour gérer l'envoi de message à un recruteur
  const handleSendMessage = (recruiter) => {
    console.log('Envoi de message à:', recruiter);
    // Ici vous pouvez implémenter la logique pour envoyer un message
    alert(`Envoi de message à ${recruiter.full_name || recruiter.first_name + ' ' + recruiter.last_name}`);
  };

  // Fonction wrapper pour relancer l'invitation depuis PersonCard
  const handleResendInvitationFromCard = (recruiter) => {
    // Trouver l'entreprise correspondante
    const company = companies.find(c => 
      c.recruiters && c.recruiters.some(r => r.id === recruiter.id)
    );
    
    if (company) {
      handleResendInvitation(recruiter, company);
    } else {
      console.error('Entreprise non trouvée pour le recruteur:', recruiter);
    }
  };

  // Fonction pour approuver/désapprouver une entreprise
  const handleToggleApproval = async (company) => {
    try {
      const newApprovedStatus = !company.approved;
      const response = await axios.post(`${apiBaseUrl}/companies/forum/approve/`, {
        company_id: company.id,
        forum_id: forumId,
        approved: newApprovedStatus
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        console.log(`Entreprise ${newApprovedStatus ? 'approuvée' : 'désapprouvée'} avec succès`);
        
        // Mettre à jour l'état local pour déclencher un re-render
        setCompanies(prevCompanies => 
          prevCompanies.map(c => 
            c.id === company.id 
              ? { ...c, approved: newApprovedStatus }
              : c
          )
        );
        
        // Optionnel: rafraîchir les données
        if (props.onCompanyUpdated) {
          props.onCompanyUpdated();
        }
      } else {
        console.error('Erreur lors du changement de statut:', response.data);
        setError(response.data?.message || 'Erreur lors du changement de statut de l\'entreprise');
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
      const response = await axios.delete(`${apiBaseUrl}/companies/forum/remove/`, {
        data: {
          company_id: company.id,
          forum_id: forumId
        },
        withCredentials: true
      });

      if (response.status === 200) {
        console.log('Entreprise refusée avec succès');
        
        // Supprimer l'entreprise de l'état local
        setCompanies(prevCompanies => 
          prevCompanies.filter(c => c.id !== company.id)
        );
        
        // Optionnel: rafraîchir les données
        if (props.onCompanyUpdated) {
          props.onCompanyUpdated();
        }
      } else {
        console.error('Erreur lors du refus:', response.data);
        setError(response.data?.message || 'Erreur lors du refus de l\'entreprise');
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
      <div className="companies-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div className="organizer-header-block">
          <div className="organizer-header-with-forum">
            <button onClick={handleBack} className="organizer-btn-back">
              <FaArrowLeft /> Retour
            </button>
            {forum && (
              <div className="forum-details">
                <h2 className="forum-title">{forum.name}</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{forum.start_date && forum.end_date ? `${forum.start_date} - ${forum.end_date}` : 'Dates non définies'}</span>
                </div>
              </div>
            )}
            {!forum && (
              <div className="forum-details">
                <h2 className="forum-title">Forum non défini</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>Dates non disponibles</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="page-title-section">
          <h1>Entreprises participantes</h1>
          <p>Gérez les entreprises participant à votre forum</p>
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
                    src={company.logo ? (company.logo.startsWith('http') ? company.logo : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${company.logo}`) : defaultLogo}
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
                  
                  {/* Menu à 3 points */}
                  <div className="enterprise-actions-container">
                    <div className="enterprise-menu-wrapper">
                      <button
                        className="enterprise-options-trigger"
                        onClick={(e) => toggleDropdown(index, e)}
                        title="Options"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          padding: 0,
                          margin: 0
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>
                      {dropdownOpen === index && (
                        <div className="enterprise-options-panel">
                          <button
                            className="enterprise-option-button"
                            onClick={() => {
                              handleToggleApproval(company);
                              setDropdownOpen(null);
                            }}
                          >
                            <FontAwesomeIcon icon={company.approved ? faToggleOff : faToggleOn} />
                            {company.approved ? 'Désapprouver' : 'Approuver'}
                          </button>
                          <button
                            className="enterprise-option-button"
                            onClick={() => {
                              handleAddRecruiter(company);
                              setDropdownOpen(null);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            Inviter un recruteur
                          </button>
                          <button
                            className="enterprise-option-button enterprise-delete-option"
                            onClick={() => {
                              handleRejectCompany(company);
                              setDropdownOpen(null);
                            }}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des recruteurs avec PersonCard */}
                {expandedIndex === index && (
                  <div className="recruiters-list">
                    {(!company.recruiters || company.recruiters.length === 0) ? (
                      <p className="no-recruiter">Aucun recruteur</p>
                    ) : (
                      <div className="person-cards-grid">
                        {company.recruiters.map((recruiter, idx) => (
                          <PersonCard
                            key={recruiter.id || idx}
                            person={recruiter}
                            type="recruiter"
                            onSend={handleResendInvitationFromCard}
                            showActions={true}
                            showSend={true}
                            showContact={false}
                            showView={false}
                          />
                        ))}
                      </div>
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
          apiBaseUrl={apiBaseUrl}
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