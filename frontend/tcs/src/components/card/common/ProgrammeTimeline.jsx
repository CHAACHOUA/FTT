import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faUser, faCalendarDays, faCalendarAlt, faUserTie } from '@fortawesome/free-solid-svg-icons';
import './ProgrammeTimeline.css';

const ProgrammeTimeline = ({ programmes }) => {
  if (!programmes || programmes.length === 0) {
    return (
      <div className="programme-timeline-container">
        <h3 className="programme-timeline-title">Programme</h3>
        <p className="programme-timeline-empty">Aucun programme disponible pour le moment.</p>
      </div>
    );
  }

  // Trier les programmes par date et heure
  const sortedProgrammes = programmes.sort((a, b) => {
    const dateA = new Date(`${a.start_date}T${a.start_time}`);
    const dateB = new Date(`${b.start_date}T${b.start_time}`);
    return dateA - dateB;
  });

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // Format HH:MM
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="programme-timeline-container">
      <h3 className="programme-timeline-title">Programme</h3>
      <div className="programme-cards-container">
        {sortedProgrammes.map((programme) => (
          <div key={programme.id} className="programme-item-card">
            {/* Photo du programme */}
            <div className="programme-item-image">
              {programme.photo ? (
                <img 
                  src={programme.photo.startsWith('http') ? programme.photo : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${programme.photo}`}
                  alt={programme.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="programme-item-placeholder">
                  <FontAwesomeIcon icon={faCalendarDays} />
                </div>
              )}
            </div>
            
            <div className="programme-item-details">
              {/* Badge de temps en haut à droite */}
              <div className="programme-item-time-badge">
                {formatTime(programme.start_time)}
              </div>
              
              <div className="programme-item-content">
                {/* Titre */}
                <h4 className="programme-item-title">{programme.title}</h4>
                
                {/* Date */}
                <div className="programme-item-date">
                  <FontAwesomeIcon icon={faCalendarAlt} className="programme-item-icon" />
                  <span>{formatDate(programme.start_date)}</span>
                </div>
                
                {/* Localisation */}
                <div className="programme-item-venue">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="programme-item-icon" />
                  <span>{programme.location}</span>
                </div>
                
                {/* Description */}
                {programme.description && (
                  <p className="programme-item-summary">{programme.description}</p>
                )}
              </div>
              
              {/* Speaker principal en bas à droite */}
              {programme.speakers && programme.speakers.length > 0 && (
                <div className="programme-item-main-speaker">
                  <div className="programme-item-speaker-info">
                    {programme.speakers[0].photo && (
                      <img 
                        src={programme.speakers[0].photo.startsWith('http') ? programme.speakers[0].photo : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${programme.speakers[0].photo}`}
                        alt={programme.speakers[0].full_name}
                        className="programme-item-speaker-photo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="programme-item-speaker-details">
                      <span className="programme-item-speaker-name">{programme.speakers[0].full_name}</span>
                      {programme.speakers[0].position && (
                        <span className="programme-item-speaker-role">{programme.speakers[0].position}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgrammeTimeline; 