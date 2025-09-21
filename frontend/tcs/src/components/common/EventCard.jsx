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
    <div className={`event-card ${className}`}>
      {/* Image de l'événement */}
      <div className="event-card-image">
        {event.photo ? (
          <img 
            src={getImageUrl(event.photo)}
            alt={event.title}
            onError={handleImageError}
          />
        ) : (
          <div className="event-card-placeholder">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
        )}
      </div>
      
      <div className="event-card-details">
        {/* Badge horaire de début en haut à droite */}
        {event.start_time && (
          <div className="event-card-time-badge">
            {formatTime ? formatTime(event.start_time) : event.start_time}
          </div>
        )}
        
        {/* Actions edit/delete */}
        {showActions && (
          <div className="event-card-actions">
            {onEdit && (
              <button 
                className="event-card-edit-btn"
                onClick={() => onEdit(event)}
                title="Modifier"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
            {onDelete && (
              <button 
                className="event-card-delete-btn"
                onClick={() => onDelete(event.id)}
                title="Supprimer"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        )}
        
        <div className="event-card-content">
          {/* Titre */}
          <h4 className="event-card-title">{event.title}</h4>
          
          {/* Date */}
          {event.start_date && (
            <div className="event-card-date">
              <FontAwesomeIcon icon={faCalendarAlt} className="event-card-icon" />
              <span>{formatDate ? formatDate(event.start_date) : event.start_date}</span>
            </div>
          )}
          
          
          {/* Localisation */}
          {event.location && (
            <div className="event-card-venue">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="event-card-icon" />
              <span>{event.location}</span>
            </div>
          )}
          
          {/* Description */}
          {event.description && (
            <p className="event-card-summary">{event.description}</p>
          )}
        </div>
        
        {/* Speakers */}
        {showSpeaker && event.speakers && event.speakers.length > 0 && (
          <div className="event-card-speakers">
            <div className="event-card-speakers-grid">
              {event.speakers.map((speaker, index) => (
                <div key={speaker.id || index} className="event-card-speaker-item">
                  {speaker.photo && (
                    <img 
                      src={getImageUrl(speaker.photo)}
                      alt={speaker.full_name}
                      className="event-card-speaker-photo"
                      onError={handleImageError}
                    />
                  )}
                  <div className="event-card-speaker-details">
                    <span className="event-card-speaker-name">{speaker.full_name}</span>
                    {speaker.position && (
                      <span className="event-card-speaker-role">{speaker.position}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
