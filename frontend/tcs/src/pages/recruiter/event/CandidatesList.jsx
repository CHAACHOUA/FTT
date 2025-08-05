import React, { useEffect, useState } from 'react';
import { FaDownload, FaUserCircle, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import CandidateFilters from '../../organizer/Event/CandidateFilters';
import './CandidateListRecruiter.css';

const CandidatesList = ({ forumId, accessToken, apiBaseUrl }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({});

  // Options pour les filtres
  const filterOptions = {
    contract_type: ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance'],
    sector: ['Informatique', 'Marketing', 'Finance', 'RH', 'Commercial', 'Communication'],
    experience: ['0', '1', '2', '3', '4', '5+'],
    region: ['Toulouse', 'Paris', 'Lyon', 'Marseille', 'Bordeaux'],
    education_level: ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'],
    languages: ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'],
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/forums/${forumId}/candidates/`, {
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
        setFilteredCandidates(data);
      } catch (err) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (forumId) {
      fetchCandidates();
    }
  }, [forumId, accessToken, apiBaseUrl]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...candidates];

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

    // Filtre par niveau d'études
    if (filters.education_level) {
      filtered = filtered.filter(({ search }) => {
        return search?.education_level === filters.education_level;
      });
    }

    // Filtre par langues
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(({ search }) => {
        return search?.languages?.some(lang => filters.languages.includes(lang));
      });
    }

    // Filtre par compétences
    if (filters.skills) {
      const skillsTerm = filters.skills.toLowerCase();
      filtered = filtered.filter(({ search }) => {
        return search?.skills?.toLowerCase().includes(skillsTerm);
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

  if (loading) return <div>Chargement des candidats...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="candidates-list">
      {/* Section gauche : Filtres */}
      <div className="filters-section">
        <h3>Filtres</h3>
        
        {/* Barre de recherche rapide */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={filters.text || ''}
            onChange={(e) => handleFiltersChange({ ...filters, text: e.target.value })}
            className="search-input"
          />
        </div>

        {/* Filtres avancés */}
        <div className="filters-container">
          <CandidateFilters
            filters={filters}
            onChange={handleFiltersChange}
            options={filterOptions}
          />
        </div>

        {/* Bouton réinitialiser */}
        {Object.keys(filters).length > 0 && (
          <button className="reset-filters-btn" onClick={resetFilters}>
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Section droite : Candidats */}
      <div className="candidates-section">
        <div className="candidates-header">
          <h2>CVthèque - {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''}</h2>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="no-candidates">
            <p>Aucun candidat ne correspond aux critères de recherche.</p>
            {Object.keys(filters).length > 0 && (
              <button className="clear-filters-btn" onClick={resetFilters}>
                Effacer tous les filtres
              </button>
            )}
          </div>
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
                <div className="candidate-info" onClick={() => {
                  console.log('Candidat sélectionné:', candidate);
                  setSelectedCandidate(candidate);
                }} style={{ cursor: 'pointer' }}>
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

      {selectedCandidate && (
        <CandidateProfile
          candidateData={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default CandidatesList;
