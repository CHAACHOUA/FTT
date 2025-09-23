import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload, FaUserCircle, FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import CandidateProfile from '../../../candidate/profile/CandidateProfile';
import './CandidateListRecruiter.css'; // On reprend le même style CSS

const MatchingCandidates = ({ candidates: candidatesProp, onClose }) => {
  const location = useLocation();

  const candidates = candidatesProp || (location.state?.candidates || []);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  // Fonction pour déterminer le classement relatif
  const getRelativeRanking = (candidates, currentScore) => {
    // Trier les candidats par score décroissant
    const sortedCandidates = [...candidates].sort((a, b) => {
      const scoreA = a.match_score ?? a.score ?? 0;
      const scoreB = b.match_score ?? b.score ?? 0;
      return scoreB - scoreA;
    });

    // Trouver la position du candidat actuel
    const position = sortedCandidates.findIndex(candidate => {
      const score = candidate.match_score ?? candidate.score ?? 0;
      return score === currentScore;
    });

    // Retourner le classement relatif (position + 1) / total
    return {
      rank: position + 1,
      total: candidates.length,
      label: getRankingLabel(position + 1, candidates.length),
      color: getRankingColor(position + 1, candidates.length)
    };
  };

  // Fonction pour obtenir le label du classement
  const getRankingLabel = (rank, total) => {
    if (rank === 1) return '1er';
    if (rank === 2) return '2ème';
    if (rank === 3) return '3ème';
    return `${rank}ème`;
  };

  // Fonction pour obtenir la couleur du classement
  const getRankingColor = (rank, total) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 20) return '#10b981'; // Vert pour les 20% meilleurs
    if (percentage <= 40) return '#3b82f6'; // Bleu pour les 20-40%
    if (percentage <= 60) return '#f59e0b'; // Orange pour les 40-60%
    if (percentage <= 80) return '#ef4444'; // Rouge pour les 60-80%
    return '#6b7280'; // Gris pour les 80-100%
  };

  return (
    <div className="matching-candidates-container">
      <div className="cards-container">
        {candidates.map((candidate, index) => {
          const score = candidate.match_score ?? candidate.score ?? null;
          const ranking = score !== null ? getRelativeRanking(candidates, score) : null;
          
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
                        : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${candidate.profile_picture}`
                    }
                    alt={`${candidate.first_name} ${candidate.last_name}`}
                  />
                ) : (
                  <FaUserCircle className="default-avatar" />
                )}
              </div>

              <div className="candidate-info">
                <h3>{candidate.first_name} {candidate.last_name}</h3>

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
                  href={`${process.env.REACT_APP_API_BASE_URL}${candidate.cv_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-download"
                  title="Télécharger le CV"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaDownload />
                </a>
              )}

              <div className="candidate-matching-info">
                {/* Section Score de matching améliorée */}
                {score !== null && ranking && (
                  <div className="matching-score-section">
                    <div className="matching-score-header">
                      <FaTrophy className="matching-trophy-icon" />
                      <span className="matching-score-label">Score de matching</span>
                      <div className="matching-ranking">
                        <span className="ranking-number">{ranking.rank}/{ranking.total}</span>
                        <span className="ranking-label" style={{ color: ranking.color }}>
                          {ranking.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="matching-progress-container">
                      <div className="matching-progress-bar">
                        <div 
                          className="matching-progress-fill"
                          style={{ 
                            width: `${score}%`,
                            backgroundColor: ranking.color
                          }}
                        ></div>
                      </div>
                      <span className="matching-percentage">{score}%</span>
                    </div>
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