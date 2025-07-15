import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload, FaUserCircle, FaMapMarkerAlt } from 'react-icons/fa';
import CandidateProfile from '../../candidate/CandidateProfile';
import './CandidateListRecruiter.css'; // On reprend le même style CSS

const MatchingCandidates = ({ candidates: candidatesProp, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const candidates = candidatesProp || (location.state?.candidates || []);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  return (
    <div className="matching-candidates-container">
      <div className="cards-container">
        {candidates.map((candidate, index) => {
          const score = candidate.match_score ?? candidate.score ?? null;
          return (
            <div
              key={index}
              className="candidate-card"
              onClick={() => setSelectedCandidate(candidate)}
              style={{ cursor: 'pointer' }}
            >
              <div className="candidate-photo">
                {candidate.profile_picture ? (
                  <img
                    src={
                      candidate.profile_picture.startsWith('http')
                        ? candidate.profile_picture
                        : `${process.env.REACT_APP_API_BASE_URL}${candidate.profile_picture}`
                    }
                    alt={`${candidate.first_name} ${candidate.last_name}`}
                  />
                ) : (
                  <FaUserCircle className="default-avatar" />
                )}
              </div>

              <div className="candidate-info">
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

                {score !== null && (
                <div className="matching-score">
  <span className="score-label">Matching Score</span>
  <div className="score-bar">
    <div className="progress" style={{ width: `${score}%` }}></div>
  </div>
  <span className="score-value">{score}%</span>
</div>

                )}
              </div>

              {candidate.cv_file && (
                <a
                  className="cv-download"
                  href={
                    candidate.cv_file.startsWith('http')
                      ? candidate.cv_file
                      : `${process.env.REACT_APP_API_BASE_URL}${candidate.cv_file}`
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
          );
        })}
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

export default MatchingCandidates;