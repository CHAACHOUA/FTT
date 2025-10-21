import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faPhone, 
  faClock, 
  faUser, 
  faCalendarAlt,
  faEdit,
  faTrash,
  faPlay
} from '@fortawesome/free-solid-svg-icons';

const AgendaCard = ({ 
  slot, 
  onEdit, 
  onDelete, 
  onStartInterview,
  isPast = false,
  isInConflict = false
}) => {
  const getTypeIcon = (type) => {
    return type === 'video' ? faVideo : faPhone;
  };

  const getTypeColor = (type) => {
    return type === 'video' ? '#3b82f6' : '#10b981';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'booked': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'booked': return 'Réservé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`agenda-card ${isPast ? 'past' : ''} ${isInConflict ? 'conflict' : ''}`}>
      {isInConflict && (
        <div className="conflict-indicator" style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#DC2626',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          ⚠️ CONFLIT
        </div>
      )}
      <div className="agenda-card-header">
        <div className="agenda-card-type">
          <FontAwesomeIcon 
            icon={getTypeIcon(slot.type)} 
            style={{ color: getTypeColor(slot.type) }}
          />
          <span className="type-label">
            {slot.type === 'video' ? 'Visioconférence' : 'Téléphone'}
          </span>
        </div>
        
        <div className="agenda-card-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(slot.status) }}
          >
            {getStatusText(slot.status)}
          </span>
        </div>
      </div>

      <div className="agenda-card-content">
        <div className="agenda-card-time">
          <FontAwesomeIcon icon={faClock} />
          <span className="time-range">
            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          </span>
        </div>

        <div className="agenda-card-date">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>{formatDate(slot.date)}</span>
        </div>

        {slot.candidate && (
          <div className="agenda-card-candidate">
            <FontAwesomeIcon icon={faUser} />
            <div className="candidate-info">
              <strong>{slot.candidate.name}</strong>
              <span>{slot.candidate.email}</span>
            </div>
          </div>
        )}

        {slot.description && (
          <div className="agenda-card-description">
            <p>{slot.description}</p>
          </div>
        )}

        {slot.meeting_link && (
          <div className="agenda-card-link">
            <a 
              href={slot.meeting_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="meeting-link"
            >
              <FontAwesomeIcon icon={faPlay} />
              Rejoindre la réunion
            </a>
          </div>
        )}
      </div>

      <div className="agenda-card-actions">
        {slot.status === 'available' && !isPast && (
          <button 
            className="btn-edit"
            onClick={() => onEdit(slot)}
          >
            <FontAwesomeIcon icon={faEdit} />
            Modifier
          </button>
        )}

        {slot.status === 'booked' && !isPast && (
          <button 
            className="btn-start"
            onClick={() => onStartInterview(slot)}
          >
            <FontAwesomeIcon icon={faPlay} />
            Démarrer
          </button>
        )}

        {!isPast && (
          <button 
            className="btn-delete"
            onClick={() => onDelete(slot)}
          >
            <FontAwesomeIcon icon={faTrash} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;
