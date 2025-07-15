import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaDownload, FaUserCircle, FaMapMarkerAlt, FaUserFriends, FaFileAlt, FaUniversalAccess, FaBriefcase } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import Navbar from '../../common/NavBar';
import './CandidatesList.css';
import CandidateFilters from './CandidateFilters';

const CandidatesList = (props) => {
  const location = useLocation();
  const forumId = props.forumId || location.state?.forumId;
  const accessToken = props.accessToken || location.state?.accessToken;
  const apiBaseUrl = props.apiBaseUrl || location.state?.apiBaseUrl;

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({
    contract_type: ['CDD', 'CDI', 'Stage', 'Alternance'],
    sector: ['Marketing', 'Informatique', 'RH'],
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

  if (!forumId || !accessToken || !apiBaseUrl) {
    return <div>Erreur : données manquantes pour afficher la liste des candidats.</div>;
  }

  if (loading) return <div>Chargement des candidats...</div>;
  if (error) return <div>Erreur : {error}</div>;

  // KPIs (calculés sur tous les candidats)
  const total = candidates.length;
  const withCV = candidates.filter(item => item.candidate.cv_file).length;
  const rqth = candidates.filter(item => item.search.rqth).length;
  const contratCounts = {};
  candidates.forEach(item => {
    (item.search.contract_type || []).forEach(type => {
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
      <div className="candidates-wrapper">
        
        <div className="kpi-row">
          <div className="kpi-card kpi-candidates">
            <div className="kpi-label-row">
              <span className="kpi-label">Candidats</span>
              <span className="kpi-icon kpi-blue"><FaUserFriends /></span>
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
          <div className="kpi-card kpi-contrat">
            <div className="kpi-label-row">
              <span className="kpi-label">Contrats recherchés</span>
              <span className="kpi-icon kpi-blue"><FaBriefcase /></span>
            </div>
            <ul className="kpi-list">
              {Object.entries(contratCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <li key={type}>{type} : <b>{count}</b></li>
                ))}
            </ul>
          </div>
        </div>
        <div className="candidates-flex-row">
            <aside className="candidates-filters">
            <CandidateFilters filters={filters} onChange={setFilters} options={options} />
          </aside>
          <div className="candidates-main">
            <h2>Liste des candidats</h2>
            {filteredCandidates.length === 0 ? (
              <p>Aucun candidat trouvé pour ce forum.</p>
            ) : (
              <div className="cards-container">
                {filteredCandidates.map(({ candidate, search }, index) => (
                  <div className="candidate-card" key={index}>
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
                      {candidate.email && <p>{candidate.email}</p>}

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
                    {candidate.cv_file && (
                      <a
                        className="cv-download"
                        href={
                          candidate.cv_file.startsWith('http')
                            ? candidate.cv_file
                            : `${apiBaseUrl}${candidate.cv_file}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Télécharger le CV"
                        onClick={e => e.stopPropagation()} // pour éviter de déclencher l'ouverture popup
                      >
                        <FaDownload />
                      </a>
                    )}
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
  );
};

export default CandidatesList;
