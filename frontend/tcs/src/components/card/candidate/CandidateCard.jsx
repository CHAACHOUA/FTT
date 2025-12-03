import React from 'react';
import { FaUserCircle, FaMapMarkerAlt, FaDownload, FaTimes } from 'react-icons/fa';
import { Button, Input, Card, Badge } from '../../common';
import '../../../pages/recruiter/event/common/CandidateListRecruiter.css';

const CandidateCard = ({ 
  candidate, 
  apiBaseUrl, 
  onCandidateClick, 
  onRemoveFromMeetings, 
  showRemoveButton = false,
  className = "candidate-card",
  forum = null
}) => {
  const handleCandidateClick = () => {
    if (onCandidateClick) {
      onCandidateClick(candidate);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemoveFromMeetings) {
      onRemoveFromMeetings(candidate);
    }
  };

  const handleCvDownload = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`${className} ${showRemoveButton ? 'meeting-card' : ''}`}
      onClick={handleCandidateClick}
      style={{ cursor: onCandidateClick ? 'pointer' : 'default' }}
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
        <div className="candidate-name-row">
          <h3>{candidate.first_name} {candidate.last_name}</h3>
          {candidate.cv_file && (
            <a
              className="cv-download-inline"
              href={
                candidate.cv_file.startsWith('http')
                  ? candidate.cv_file
                  : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${candidate.cv_file}`
              }
              target="_blank"
              rel="noopener noreferrer"
              title="Télécharger le CV"
              onClick={handleCvDownload}
            >
              <FaDownload />
            </a>
          )}
        </div>

        <div className="sectors-container">
          {(candidate.search?.sector?.length ?? 0) > 0
            ? candidate.search.sector.map((sector, i) => (
                <Badge key={i} type="sector">{sector}</Badge>
              ))
            : <Badge type="sector" variant="empty">Non renseigné</Badge>
          }
        </div>

        <p className="region">
          <FaMapMarkerAlt className="icon-location" />
          {candidate.search?.region || 'Non renseignée'}
        </p>
      </div>


      {/* Bouton de suppression - seulement si showRemoveButton est true */}
      {showRemoveButton && (
        <div className="meeting-actions">
          <button
            className="remove-meeting-btn"
            onClick={handleRemoveClick}
            title="Retirer des rencontres"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
