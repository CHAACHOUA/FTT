import React, { useEffect, useState } from 'react';
import { FaDownload, FaUserCircle, FaMapMarkerAlt } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import './CandidateListRecruiter.css';

const CandidatesList = ({ forumId, accessToken, apiBaseUrl }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  if (loading) return <div>Chargement des candidats...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="candidates-list">
      <h2>Liste des candidats</h2>
      {candidates.length === 0 ? (
        <p>Aucun candidat trouvé pour ce forum.</p>
      ) : (
        <div className="cards-container">
          {candidates.map(({ candidate, search }, index) => (
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
