import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUserFriends, FaFileAlt, FaUniversalAccess, FaBriefcase, FaFileExport, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import CandidateCard from '../../../components/CandidateCard';
import Navbar from '../../common/NavBar';
import Loading from '../../common/Loading';
import './CandidatesList.css';
import '../../../pages/styles/organizer/organizer-buttons.css';
import CandidateFilters from './CandidateFilters';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const CandidatesList = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const forumId = props.forumId || location.state?.forumId;
  const apiBaseUrl = props.apiBaseUrl || location.state?.apiBaseUrl;
  const forum = props.forum || location.state?.forum;

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({});
  const [forumData, setForumData] = useState(forum);
  const [options] = useState({
    contract_type: [], // Sera rempli par l'API
    sector: [], // Sera rempli par l'API
    experience: ['0', '1', '2', '3', '4', '5+'],
    region: ['Toulouse', 'Paris', 'Lyon'],
    languages: [], // Sera rempli par l'API depuis les constantes
  });

  // Récupérer les données du forum si elles ne sont pas disponibles
  useEffect(() => {
    const fetchForumData = async () => {
      if (!forum && forumId && apiBaseUrl && isAuthenticated && !isAuthLoading) {
        try {
          const response = await axios.get(`${apiBaseUrl}/forums/${forumId}/`, {
            withCredentials: true
          });

          setForumData(response.data);
        } catch (err) {
          console.error('Erreur lors de la récupération du forum:', err);
        }
      } else if (forum) {
        setForumData(forum);
      }
    };

    fetchForumData();
  }, [forum, forumId, apiBaseUrl, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    const fetchCandidates = async () => {
      // Attendre que l'authentification soit vérifiée
      if (isAuthLoading) {
        return;
      }
      
      if (!isAuthenticated) {
        setError('Vous devez être connecté pour accéder à cette page.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${apiBaseUrl}/forums/${forumId}/organizer/candidates/`, {
          withCredentials: true
        });

        setCandidates(response.data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId && apiBaseUrl && isAuthenticated && !isAuthLoading) {
      fetchCandidates();
    }
  }, [forumId, apiBaseUrl, isAuthenticated, isAuthLoading]);

  // Fonction pour télécharger la liste des candidats
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

  const downloadCandidatesList = () => {
    // Préparer les données pour le CSV
    const csvData = candidates.map(({ candidate }) => {
      const isActive = candidate.is_active !== false; // Considérer actif par défaut si pas spécifié
      
      return {
        nom: candidate.last_name || '',
        prenom: candidate.first_name || '',
        email: isActive ? (candidate.email || '') : '***@***.***', // Email anonymisé si compte supprimé
        telephone: candidate.phone || '',
        statut: isActive ? 'Actif' : 'Compte supprimé'
      };
    });

    // Créer le contenu CSV
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => [
        `"${row.nom}"`,
        `"${row.prenom}"`,
        `"${row.email}"`,
        `"${row.telephone}"`,
        `"${row.statut}"`
      ].join(','))
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `liste_candidats_forum_${forumId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Attendre que l'authentification soit vérifiée
  if (isAuthLoading) {
    return (
      <div className="candidates-list">
        <Navbar />
        <div className="organizer-header-block">
          <button onClick={handleBack} className="organizer-btn-back">
            <FaArrowLeft /> Retour
          </button>
          <div className="header-content">
            <h1>Liste des Candidats</h1>
            <p>Gérez les candidats participant à votre forum</p>
          </div>
        </div>
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="candidates-list">
        <Navbar />
        <div className="organizer-header-block">
          <button onClick={handleBack} className="organizer-btn-back">
            <FaArrowLeft /> Retour
          </button>
          <div className="header-content">
            <h1>Liste des Candidats</h1>
            <p>Gérez les candidats participant à votre forum</p>
          </div>
        </div>
      </div>
    );
  }

  if (!forumId || !apiBaseUrl) {
    return (
      <div className="candidates-list">
        <Navbar />
        <div className="organizer-header-block">
          <button onClick={handleBack} className="organizer-btn-back">
            <FaArrowLeft /> Retour
          </button>
          <div className="header-content">
            <h1>Liste des Candidats</h1>
            <p>Gérez les candidats participant à votre forum</p>
          </div>
        </div>
        <div className="kpi-section">
          <div className="kpi-row">
            <div className="kpi-card kpi-candidates">
              <div className="kpi-label-row">
                <span className="kpi-label">CANDIDATS</span>
                <span className="kpi-icon kpi-pink"><FaUserFriends /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
            <div className="kpi-card kpi-cv">
              <div className="kpi-label-row">
                <span className="kpi-label">CV disponibles</span>
                <span className="kpi-icon kpi-pink"><FaFileAlt /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
            <div className="kpi-card kpi-rqth">
              <div className="kpi-label-row">
                <span className="kpi-label">RQTH</span>
                <span className="kpi-icon kpi-green"><FaUniversalAccess /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
            <div className="kpi-card kpi-contrat">
              <div className="kpi-label-row">
                <span className="kpi-label">Contrats recherchés</span>
                <span className="kpi-icon kpi-blue"><FaBriefcase /></span>
              </div>
              <ul className="kpi-list">
                <li>Aucun candidat</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="candidates-wrapper">
          <div className="candidates-flex-row">
            <aside className="candidates-filters">
              <CandidateFilters filters={filters} onChange={setFilters} options={options} />
            </aside>
            <div className="candidates-main">
              <h2>Liste des candidats</h2>
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                Erreur : données manquantes pour afficher la liste des candidats.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }
  
  if (error) {
    return (
      <div className="candidates-list">
        <Navbar />
        <div className="organizer-header-block">
          <button onClick={handleBack} className="organizer-btn-back">
            <FaArrowLeft /> Retour
          </button>
          <div className="header-content">
            <h1>Liste des Candidats</h1>
            <p>Gérez les candidats participant à votre forum</p>
          </div>
        </div>
        <div className="kpi-section">
          <div className="kpi-row">
            <div className="kpi-card kpi-candidates">
              <div className="kpi-label-row">
                <span className="kpi-label">CANDIDATS</span>
                <span className="kpi-icon kpi-pink"><FaUserFriends /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
            <div className="kpi-card kpi-cv">
              <div className="kpi-label-row">
                <span className="kpi-label">CV disponibles</span>
                <span className="kpi-icon kpi-pink"><FaFileAlt /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
            <div className="kpi-card kpi-rqth">
              <div className="kpi-label-row">
                <span className="kpi-label">RQTH</span>
                <span className="kpi-icon kpi-green"><FaUniversalAccess /></span>
              </div>
              <span className="kpi-value">0</span>
            </div>
                <div className="kpi-card kpi-top-contrat">
                  <div className="kpi-label-row">
                    <span className="kpi-label">TOP CONTRAT</span>
                    <span className="kpi-icon kpi-blue"><FaBriefcase /></span>
                  </div>
                  <span className="kpi-value">Aucun</span>
                </div>
          </div>
        </div>
        <div className="candidates-wrapper">
          <div className="candidates-flex-row">
            <aside className="candidates-filters">
              <CandidateFilters filters={filters} onChange={setFilters} options={options} />
            </aside>
            <div className="candidates-main">
              <h2>Liste des candidats (0 candidat trouvé!)</h2>
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                Erreur : {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // KPIs (calculés sur tous les candidats)
  const total = candidates.length;
  const withCV = candidates.filter(item => item.candidate?.cv_file).length;
  const rqth = candidates.filter(item => item.search?.rqth).length;
  const contratCounts = {};
  candidates.forEach(item => {
    (item.search?.contract_type || []).forEach(type => {
      contratCounts[type] = (contratCounts[type] || 0) + 1;
    });
  });

  // Filtrage simple (à adapter selon la structure réelle des données)
  const filteredCandidates = candidates.filter(item => {
    const c = item.candidate;
    const s = item.search;
    // Recherche texte
    if (filters.text) {
      const txt = filters.text.toLowerCase();
      if (!(
        c.first_name?.toLowerCase().includes(txt) ||
        c.last_name?.toLowerCase().includes(txt) ||
        c.email?.toLowerCase().includes(txt)
      )) return false;
    }
    // Type de contrat
    if (filters.contract_type && filters.contract_type.length > 0) {
      if (!s.contract_type?.some(ct => filters.contract_type.includes(ct))) return false;
    }
    // Secteur
    if (filters.sector && filters.sector.length > 0) {
      if (!s.sector?.some(sec => filters.sector.includes(sec))) return false;
    }
    // Expérience
    if (filters.experience && filters.experience !== '') {
      if (String(s.experience) !== String(filters.experience)) return false;
    }
    // Région
    if (filters.region && filters.region.length > 0) {
      if (!filters.region.includes(s.region)) return false;
    }
    // Langues
    if (filters.languages && filters.languages.length > 0) {
      // Vérifier différentes structures possibles pour les langues
      const candidateLanguages = c.candidate_languages || c.languages || c.candidate?.languages || [];
      if (!candidateLanguages.some(lg => {
        const language = typeof lg === 'string' ? lg : (lg?.name || lg?.language || String(lg));
        return filters.languages.includes(language);
      })) return false;
    }
    // Compétences (recherche texte)
    if (filters.skills && filters.skills !== '') {
      if (!c.skills?.some(skill => {
        const skillText = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || String(skill));
        return skillText.toLowerCase().includes(filters.skills.toLowerCase());
      })) return false;
    }
    // RQTH
    if (filters.rqth) {
      if (!s.rqth) return false;
    }
    // CV disponible
    if (filters.cv_only) {
      if (!c.cv_file) return false;
    }
    return true;
  });

  return (
    <div className="candidates-list">
      <Navbar />
      <div className="candidates-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <div className="organizer-header-block">
          <div className="organizer-header-with-forum">
            <button onClick={handleBack} className="organizer-btn-back">
              <FaArrowLeft /> Retour
            </button>
            {forumData && (
              <div className="forum-details">
                <h2 className="forum-title">{forumData.name}</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{forumData.start_date && forumData.end_date ? `${forumData.start_date} - ${forumData.end_date}` : 'Dates non définies'}</span>
                </div>
              </div>
            )}
            {!forumData && (
              <div className="forum-details">
                <Loading />
              </div>
            )}
          </div>
        </div>

        <div className="page-title-section">
          <div className="page-title-header">
            <div>
              <h1>Liste des Candidats</h1>
              <p>Gérez les candidats participant à votre forum</p>
            </div>
            <button 
              className="download-candidates-btn" 
              onClick={downloadCandidatesList}
              title="Télécharger la liste complète des candidats"
            >
              <FaFileExport /> Exporter la liste des candidats
            </button>
          </div>
        </div>
      <div className="kpi-section">
        <div className="kpi-row">
          <div className="kpi-card kpi-candidates">
            <div className="kpi-label-row">
              <span className="kpi-label">CANDIDATS</span>
              <span className="kpi-icon kpi-pink"><FaUserFriends /></span>
            </div>
            <span className="kpi-value">{total}</span>
          </div>
          <div className="kpi-card kpi-cv">
            <div className="kpi-label-row">
              <span className="kpi-label">CV disponibles</span>
              <span className="kpi-icon kpi-pink"><FaFileAlt /></span>
            </div>
            <span className="kpi-value">{withCV}</span>
          </div>
          <div className="kpi-card kpi-rqth">
            <div className="kpi-label-row">
              <span className="kpi-label">RQTH</span>
              <span className="kpi-icon kpi-green"><FaUniversalAccess /></span>
            </div>
            <span className="kpi-value">{rqth}</span>
          </div>
          <div className="kpi-card kpi-top-contrat">
            <div className="kpi-label-row">
              <span className="kpi-label">TOP CONTRAT</span>
              <span className="kpi-icon kpi-blue"><FaBriefcase /></span>
            </div>
            <span className="kpi-value">
              {Object.keys(contratCounts).length > 0 ? 
                Object.entries(contratCounts)
                  .sort((a, b) => b[1] - a[1])[0][0] 
                : 'Aucun'
              }
            </span>
          </div>
        </div>
      </div>
      <div className="candidates-wrapper">
        <div className="candidates-flex-row">
            <aside className="candidates-filters">
            <CandidateFilters filters={filters} onChange={setFilters} options={options} />
          </aside>
          <div className="candidates-main">
            <h2>Liste des candidats ({filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''})</h2>
            {filteredCandidates.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#6b7280',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #d1d5db',
                margin: '2rem 0'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
                  {candidates.length === 0 ? 'Aucun candidat inscrit pour ce forum' : 'Aucun candidat trouvé avec les filtres actuels'}
                </h3>
                <p style={{ fontSize: '1rem' }}>
                  {candidates.length === 0 
                    ? 'Les candidats apparaîtront ici une fois qu\'ils s\'inscriront à votre forum.'
                    : 'Essayez de modifier vos critères de recherche.'
                  }
                </p>
              </div>
            ) : (
              <div className="cards-container">
                {filteredCandidates.map(({ candidate, search }, index) => (
                  <CandidateCard
                    key={index}
                    candidate={{ ...candidate, search }}
                    apiBaseUrl={apiBaseUrl}
                    onCandidateClick={setSelectedCandidate}
                    onRemoveFromMeetings={null}
                    showRemoveButton={false}
                    className="candidate-card"
                  />
                ))}
              </div>
            )}
          </div>
        
        </div>
        {selectedCandidate && (
          <CandidateProfile
            candidateData={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
              </div>
      </div>
      </div>
    );
  };
  
  export default CandidatesList;
