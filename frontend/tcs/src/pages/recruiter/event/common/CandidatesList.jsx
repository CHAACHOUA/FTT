import React, { useEffect, useState } from 'react';
import { FaUserFriends, FaFileAlt, FaUniversalAccess, FaBriefcase, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import CandidateProfile from '../../../candidate/profile/CandidateProfile';
import CandidateFilters from '../../../../components/filters/candidate/CandidateFilters';
import CandidateCard from '../../../../components/card/candidate/CandidateCard';
import CompanyApprovalCheck from '../../../../utils/CompanyApprovalCheck';
import Loading from '../../../../components/loyout/Loading';
import MatchingOffers from './MatchingOffers';
import '../../../organizer/Event/candidates/CandidatesList.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const CandidatesList = ({ forumId, apiBaseUrl, forum, accessToken }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({});
  const [isIntelligentSearch, setIsIntelligentSearch] = useState(false);

  // Options pour les filtres
  const filterOptions = {
    contract_type: ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance'],
    sector: ['Informatique', 'Marketing', 'Finance', 'RH', 'Commercial', 'Communication'],
    experience: ['0', '1', '2', '3', '4', '5+'],
    region: ['Toulouse', 'Paris', 'Lyon', 'Marseille', 'Bordeaux'],
    languages: [], // Sera rempli par l'API depuis les constantes
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/forums/${forumId}/candidates/`, {
          withCredentials: true,
        });

        setCandidates(response.data);
        setFilteredCandidates(response.data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchCandidates();
    }
  }, [forumId, apiBaseUrl]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...candidates];
    
    // Debug: Afficher la structure des données pour le premier candidat
    if (candidates.length > 0) {
      console.log('Structure des données candidat:', candidates[0]);
    }

    // Filtre par texte (nom, prénom, email)
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      filtered = filtered.filter(({ candidate }) => {
        const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
        const email = candidate.email?.toLowerCase() || '';
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    // Filtre par secteur
    if (filters.sector && filters.sector.length > 0) {
      filtered = filtered.filter(({ search }) => {
        return search?.sector?.some(sector => filters.sector.includes(sector));
      });
    }

    // Filtre par type de contrat
    if (filters.contract_type && filters.contract_type.length > 0) {
      filtered = filtered.filter(({ search }) => {
        return search?.contract_type && filters.contract_type.includes(search.contract_type);
      });
    }

    // Filtre par région
    if (filters.region) {
      filtered = filtered.filter(({ search }) => {
        return search?.region === filters.region;
      });
    }

    // Filtre par expérience
    if (filters.experience) {
      filtered = filtered.filter(({ search }) => {
        return search?.experience === filters.experience;
      });
    }


    // Filtre par langues
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(({ search, candidate }) => {
        // Vérifier dans search.languages ou candidate.languages
        const searchLanguages = search?.languages || candidate?.languages || candidate?.candidate_languages || [];
        return searchLanguages.some(lang => {
          const language = typeof lang === 'string' ? lang : (lang?.name || lang?.language || String(lang));
          return filters.languages.includes(language);
        });
      });
    }

    // Filtre par compétences (recherche texte)
    if (filters.skills && filters.skills !== '') {
      const skillsTerm = filters.skills.toLowerCase();
      filtered = filtered.filter(({ search, candidate }) => {
        // Vérifier dans search.skills ou candidate.skills
        const candidateSkills = search?.skills || candidate?.skills || [];
        
        if (!candidateSkills) return false;
        
        // Si c'est un tableau de compétences
        if (Array.isArray(candidateSkills)) {
          return candidateSkills.some(skill => {
            const skillText = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || String(skill));
            return skillText.toLowerCase().includes(skillsTerm);
          });
        }
        
        // Si c'est une chaîne de compétences
        const skillsText = typeof candidateSkills === 'string' ? candidateSkills : String(candidateSkills);
        return skillsText.toLowerCase().includes(skillsTerm);
      });
    }

    // Filtre RQTH
    if (filters.rqth) {
      filtered = filtered.filter(({ search }) => {
        return search?.rqth === true;
      });
    }

    // Filtre CV disponible
    if (filters.cv_only) {
      filtered = filtered.filter(({ candidate }) => {
        return candidate.cv_file;
      });
    }

    setFilteredCandidates(filtered);
  }, [candidates, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleExportCandidates = () => {
    // Créer un CSV avec les données des candidats
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Localisation', 'CV disponible', 'RQTH'],
      ...filteredCandidates.map(item => [
        item.candidate?.last_name || '',
        item.candidate?.first_name || '',
        item.candidate?.email || '',
        item.candidate?.phone || '',
        item.candidate?.location || '',
        item.candidate?.cv_file ? 'Oui' : 'Non',
        item.search?.rqth ? 'Oui' : 'Non'
      ])
    ].map(row => row.join(',')).join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidats_forum_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  if (loading) {
    return (
      <Loading />
    );
  }
  
  if (error) {
    return (
      <CompanyApprovalCheck 
        forumId={forumId} 
        apiBaseUrl={apiBaseUrl}
        fallbackMessage="L'accès à la CVthèque n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
      >
        <div className="candidates-list">
          <div className="candidates-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div className="recruiter-header-block">
              <div className="organizer-header-with-forum">
                <div className="forum-details">
                  <h2 className="forum-title">Liste des candidats (0 candidat trouvé!)</h2>
                </div>
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
                  <CandidateFilters filters={filters} onChange={handleFiltersChange} options={filterOptions} />
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
        </div>
      </CompanyApprovalCheck>
    );
  }

  // Si recherche intelligente activée, afficher MatchingOffers
  if (isIntelligentSearch) {
    return (
      <CompanyApprovalCheck 
        forumId={forumId} 
        apiBaseUrl={apiBaseUrl}
        fallbackMessage="L'accès à la recherche intelligente n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
      >
        <div className="candidates-list">
          <div className="candidates-container" style={{ margin: '0 auto', padding: '0 20px' }}>
            <div className="recruiter-header-block">
              <div className="organizer-header-with-forum">
                <div className="forum-details">
                  <h2 className="forum-title">CVthèque</h2>
                </div>
              </div>
              <div className="header-actions">
                <div className="toggle-switch-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>CVthèque</span>
                  <label className="toggle-switch" style={{ 
                    position: 'relative', 
                    display: 'inline-block', 
                    width: '50px', 
                    height: '26px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isIntelligentSearch}
                      onChange={() => setIsIntelligentSearch(!isIntelligentSearch)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="toggle-slider" style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#3b82f6',
                      transition: '0.3s',
                      borderRadius: '26px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '20px',
                        width: '20px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transform: isIntelligentSearch ? 'translateX(24px)' : 'translateX(0)'
                      }}></span>
                    </span>
                  </label>
                  <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '600' }}>Recherche intelligente</span>
                </div>
              </div>
            </div>
            <MatchingOffers forum={forum} accessToken={accessToken} apiBaseUrl={apiBaseUrl} />
          </div>
        </div>
      </CompanyApprovalCheck>
    );
  }

  return (
    <CompanyApprovalCheck 
      forumId={forumId} 
      apiBaseUrl={apiBaseUrl}
      fallbackMessage="L'accès à la CVthèque n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum."
    >
      <div className="candidates-list">
        <div className="candidates-container" style={{ margin: '0 auto', padding: '0 20px' }}>
          <div className="recruiter-header-block">
            <div className="organizer-header-with-forum">
              <div className="forum-details">
                <h2 className="forum-title">Liste des candidats ({filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''})</h2>
              </div>
            </div>
            <div className="header-actions">
              <div className="toggle-switch-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: isIntelligentSearch ? '#6b7280' : '#1f2937', fontWeight: isIntelligentSearch ? '500' : '600' }}>CVthèque</span>
                <label className="toggle-switch" style={{ 
                  position: 'relative', 
                  display: 'inline-block', 
                  width: '50px', 
                  height: '26px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isIntelligentSearch}
                    onChange={() => setIsIntelligentSearch(!isIntelligentSearch)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="toggle-slider" style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isIntelligentSearch ? '#3b82f6' : '#cbd5e1',
                    transition: '0.3s',
                    borderRadius: '26px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transform: isIntelligentSearch ? 'translateX(24px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
                <span style={{ fontSize: '0.9rem', color: isIntelligentSearch ? '#3b82f6' : '#6b7280', fontWeight: isIntelligentSearch ? '600' : '500' }}>Recherche intelligente</span>
              </div>
              <button 
                className="export-candidates-btn"
                onClick={handleExportCandidates}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Exporter la liste des candidats
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
              <CandidateFilters filters={filters} onChange={handleFiltersChange} options={filterOptions} />
            </aside>
            <div className="candidates-main">
              <div className="search-bar-container" style={{ marginBottom: '0' }}>
                <div className="search-bar" style={{ position: 'relative', maxWidth: '500px' }}>
                  <FaSearch className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.1rem', zIndex: 1 }} />
                  <input
                    type="text"
                    placeholder="Nom, prénom ou email..."
                    value={filters.text || ''}
                    onChange={e => handleFiltersChange({ ...filters, text: e.target.value })}
                    className="search-input"
                    style={{ 
                      width: '100%', 
                      padding: '0.6rem 1rem 0.6rem 3rem', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: 'var(--radius-xl)', 
                      fontSize: '0.9rem', 
                      background: '#ffffff', 
                      transition: 'all 0.3s ease', 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      outline: 'none'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              </div>
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
                    {candidates.length === 0 ? 'Aucun candidat disponible pour ce forum' : 'Aucun candidat trouvé avec les filtres actuels'}
                  </h3>
                  <p style={{ fontSize: '1rem' }}>
                    {candidates.length === 0 
                      ? 'Les candidats apparaîtront ici une fois qu\'ils s\'inscriront au forum.'
                      : 'Essayez de modifier vos critères de recherche.'
                    }
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <button 
                      onClick={resetFilters}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Effacer tous les filtres
                    </button>
                  )}
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
                      forum={forum}
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
            forum={forum}
          />
        )}
        </div>
        </div>
      </div>
    </CompanyApprovalCheck>
  );
};

export default CandidatesList;
