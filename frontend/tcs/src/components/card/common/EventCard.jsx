import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faMapMarkerAlt,
  faCalendarAlt,
  faCalendarDays,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import './EventCard.css';

const EventCard = ({
  event,
  onEdit,
  onDelete,
  showActions = true,
  showSpeaker = true,
  formatTime,
  formatDate,
  className = ''
}) => {
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  const getImageUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith('http') 
      ? photo 
      : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${photo}`;
  };

  return (
    <div className={`programme-event-card ${className}`}>
      {/* Section de temps à gauche */}
      <div className="programme-time-section">
        <div className="programme-time-display">
          {event.start_time && event.end_time ? (
            `${formatTime ? formatTime(event.start_time) : event.start_time} - ${formatTime ? formatTime(event.end_time) : event.end_time}`
          ) : event.start_time ? (
            formatTime ? formatTime(event.start_time) : event.start_time
          ) : (
            'Heure non définie'
          )}
        </div>
        <div className="programme-session-type">
          {event.session_type || 'Session'}
        </div>
      </div>
      
      {/* Section de détails à droite */}
      <div className="programme-details-section">
        {/* Actions edit/delete en haut */}
        {showActions && (
          <div className="programme-actions">
            {onEdit && (
              <button 
                className="programme-edit-btn"
                onClick={() => onEdit(event)}
                title="Modifier"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
            {onDelete && (
              <button 
                className="programme-delete-btn"
                onClick={() => onDelete(event.id)}
                title="Supprimer"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        )}
        
        <div className="programme-content">
          {/* Titre */}
          <h4 className="programme-title">{event.title}</h4>
          
          {/* Description */}
          {event.description && (
            <p className="programme-description">{event.description}</p>
          )}
          
          {/* Localisation */}
          {event.location && (
            <div className="programme-location">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="programme-icon" />
              <span>{event.location}</span>
            </div>
          )}
          
          {/* Speakers */}
          {showSpeaker && event.speakers && event.speakers.length > 0 && (
            <div className="programme-main-speaker">
              <div className="programme-speakers-list">
                {event.speakers.slice(0, 3).map((speaker, index) => (
                  <div key={speaker.id} className="programme-speaker-item">
                    {speaker.photo && (
                      <img 
                        src={getImageUrl(speaker.photo)}
                        alt={speaker.full_name}
                        className="programme-speaker-photo"
                        onError={handleImageError}
                      />
                    )}
                    <div className="programme-speaker-details">
                      <span className="programme-speaker-name">{speaker.full_name}</span>
                      {speaker.position && (
                        <span className="programme-speaker-role">{speaker.position}</span>
                      )}
                    </div>
                  </div>
                ))}
                {event.speakers.length > 3 && (
                  <div className="programme-speaker-more">
                    +{event.speakers.length - 3} autre{event.speakers.length > 4 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
