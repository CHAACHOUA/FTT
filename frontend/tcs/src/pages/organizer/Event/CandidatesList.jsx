import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload, FaUserCircle, FaMapMarkerAlt, FaUserFriends, FaFileAlt, FaUniversalAccess, FaBriefcase, FaFileExport, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import Navbar from '../../common/NavBar';
import './CandidatesList.css';
import '../../../pages/styles/organizer/organizer-buttons.css';
import CandidateFilters from './CandidateFilters';

const CandidatesList = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const forumId = props.forumId || location.state?.forumId;
  const accessToken = props.accessToken || location.state?.accessToken;
  const apiBaseUrl = props.apiBaseUrl || location.state?.apiBaseUrl;
  const forum = props.forum || location.state?.forum;

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({
    contract_type: [], // Sera rempli par l'API
    sector: [], // Sera rempli par l'API
    experience: ['0', '1', '2', '3', '4', '5+'],
    region: ['Toulouse', 'Paris', 'Lyon'],
    education_level: ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'],
    languages: ['Français', 'Anglais', 'Espagnol'],
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/forums/${forumId}/organizer/candidates/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des candidats');
        }

        const data = await response.json();
        setCandidates(data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId && accessToken && apiBaseUrl) {
      fetchCandidates();
    }
  }, [forumId, accessToken, apiBaseUrl]);

  // Fonction pour télécharger la liste des candidats
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

  if (!forumId || !accessToken || !apiBaseUrl) {
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
              <span className="kpi-value">...</span>
            </div>
            <div className="kpi-card kpi-cv">
              <div className="kpi-label-row">
                <span className="kpi-label">CV disponibles</span>
                <span className="kpi-icon kpi-pink"><FaFileAlt /></span>
              </div>
              <span className="kpi-value">...</span>
            </div>
            <div className="kpi-card kpi-rqth">
              <div className="kpi-label-row">
                <span className="kpi-label">RQTH</span>
                <span className="kpi-icon kpi-green"><FaUniversalAccess /></span>
              </div>
              <span className="kpi-value">...</span>
            </div>
                <div className="kpi-card kpi-top-contrat">
                  <div className="kpi-label-row">
                    <span className="kpi-label">TOP CONTRAT</span>
                    <span className="kpi-icon kpi-blue"><FaBriefcase /></span>
                  </div>
                  <span className="kpi-value">...</span>
                </div>
          </div>
        </div>
        <div className="candidates-wrapper">
          <div className="candidates-flex-row">
            <aside className="candidates-filters">
              <CandidateFilters filters={filters} onChange={setFilters} options={options} />
            </aside>
            <div className="candidates-main">
              <h2>Liste des candidats (chargement...)</h2>
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                Chargement des candidats...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
    if (filters.region && filters.region !== '') {
      if (s.region !== filters.region) return false;
    }
    // Niveau d'études
    if (filters.education_level && filters.education_level !== '') {
      if (c.education_level !== filters.education_level) return false;
    }
    // Langues
    if (filters.languages && filters.languages.length > 0) {
      if (!c.candidate_languages?.some(lg => filters.languages.includes(lg))) return false;
    }
    // Compétences (recherche texte)
    if (filters.skills && filters.skills !== '') {
      if (!c.skills?.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()))) return false;
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
                  <div className="candidate-card" key={index}>
                    {/* Icône de téléchargement en premier pour le positionnement */}
                    {candidate.cv_file ? (
                      <a
                        href={`${apiBaseUrl}${candidate.cv_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="organizer-cv-icon"
                        title="Télécharger le CV"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaDownload />
                      </a>
                    ) : (
                      <div
                        className="organizer-cv-icon cv-no-file"
                        title="Aucun CV disponible"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaDownload />
                      </div>
                    )}
                    
                    <div className="candidate-photo">
                      {candidate.profile_picture ? (
                        <img
                          src={
                            candidate.profile_picture.startsWith('http')
                              ? candidate.profile_picture
                              : `${apiBaseUrl}${candidate.profile_picture}`
                          }
                          alt={`${candidate.first_name} ${candidate.last_name}`}
                        />
                      ) : (
                        <FaUserCircle className="default-avatar" />
                      )}
                    </div>
                    <div className="candidate-info" onClick={() => setSelectedCandidate(candidate)} style={{ cursor: 'pointer' }}>
                      <h3>{candidate.first_name} {candidate.last_name}</h3>

                      <div className="sectors-container">
                        {(search?.sector?.length ?? 0) > 0
                          ? search.sector.map((sector, i) => (
                              <span key={i} className="sector-badge">{sector}</span>
                            ))
                          : <span className="sector-badge empty">Non renseigné</span>
                        }
                      </div>

                      <p className="region">
                        <FaMapMarkerAlt className="icon-location" />
                        {search?.region || 'Non renseignée'}
                      </p>
                    </div>
                  </div>
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
