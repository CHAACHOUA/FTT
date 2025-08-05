import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
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
      <div className="programme-timeline">
        {sortedProgrammes.map((programme, index) => (
          <div key={programme.id} className="programme-item">
            <div className="programme-timeline-line">
              <div className="programme-timeline-dot"></div>
              {index < sortedProgrammes.length - 1 && (
                <div className="programme-timeline-connector"></div>
              )}
            </div>
            
            <div className="programme-content">
              <div className="programme-header">
                <h4 className="programme-title">{programme.title}</h4>
                <div className="programme-time">
                  <FontAwesomeIcon icon={faClock} className="programme-icon" />
                  <span>
                    {formatTime(programme.start_time)} - {formatTime(programme.end_time)}
                  </span>
                </div>
              </div>
              
              {programme.photo && (
                <div className="programme-photo">
                  <img 
                    src={programme.photo.startsWith('http') ? programme.photo : `${process.env.REACT_APP_API_BASE_URL}${programme.photo}`}
                    alt={programme.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {programme.description && (
                <p className="programme-description">{programme.description}</p>
              )}
              
              <div className="programme-location">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="programme-icon" />
                <span>{programme.location}</span>
              </div>
              
              {programme.speakers && programme.speakers.length > 0 && (
                <div className="programme-speakers">
                  <FontAwesomeIcon icon={faUser} className="programme-icon" />
                  <div className="speakers-list">
                    {programme.speakers.map((speaker, speakerIndex) => (
                      <div key={speaker.id} className="speaker-item">
                        <div className="speaker-info">
                          <span className="speaker-name">{speaker.full_name}</span>
                          <span className="speaker-position">{speaker.position}</span>
                        </div>
                        {speaker.photo && (
                          <img 
                            src={speaker.photo.startsWith('http') ? speaker.photo : `${process.env.REACT_APP_API_BASE_URL}${speaker.photo}`}
                            alt={speaker.full_name}
                            className="speaker-photo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    ))}
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