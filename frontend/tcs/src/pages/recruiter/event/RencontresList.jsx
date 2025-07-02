import React, { useEffect, useState } from 'react';
import { FaDownload, FaUserCircle, FaMapMarkerAlt } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import './CandidatesList.css'; // on réutilise le même CSS

const RencontresList = ({ forumId, accessToken, apiBaseUrl }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/recruiters/meetings/candidates/?forum=${forumId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des candidats rencontrés');
        }

        const data = await response.json();
        // Adapter le format pour que chaque item soit directement un candidat enrichi du search
        const formatted = data.map(entry => ({
          ...entry.candidate,
          search: entry.search,
        }));
        setCandidates(formatted);
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

  if (loading) return <div>Chargement des rencontres...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="candidates-list">
      <h2>Candidats rencontrés</h2>
      {candidates.length === 0 ? (
        <p>Aucun candidat rencontré pour ce forum.</p>
      ) : (
        <div className="cards-container">
          {candidates.map((candidate, index) => (
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
              <div
                className="candidate-info"
                onClick={() => setSelectedCandidate(candidate)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{candidate.first_name} {candidate.last_name}</h3>
                {candidate.email && <p>{candidate.email}</p>}

                <div className="sectors-container">
                  {(candidate.search?.sector?.length ?? 0) > 0
                    ? candidate.search.sector.map((sector, i) => (
                        <span key={i} className="sector-badge">{sector}</span>
                      ))
                    : <span className="sector-badge empty">Non renseigné</span>
                  }
                </div>

                <p className="region">
                  <FaMapMarkerAlt className="icon-location" />
                  {candidate.search?.region || 'Non renseignée'}
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
                  onClick={e => e.stopPropagation()}
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

export default RencontresList;
