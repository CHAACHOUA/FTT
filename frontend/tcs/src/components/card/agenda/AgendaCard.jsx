import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faPhone, 
  faClock, 
  faCalendarAlt,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { formatTimeForUser } from '../../../utils/timezoneUtils';
import { useAuth } from '../../../context/AuthContext';

const AgendaCard = ({ 
  slot, 
  onEdit, 
  onDelete, 
  onStartInterview,
  isPast = false,
  isInConflict = false
}) => {
  const { user } = useAuth();
  const getTypeIcon = (type) => {
    return type === 'video' ? faVideo : faPhone;
  };

  const getTypeColor = (type) => {
    return type === 'video' ? '#3b82f6' : '#10b981';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#166534'; // text-green-800
      case 'booked': return '#854d0e'; // text-yellow-800
      case 'completed': return '#166534'; // text-green-800
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'available': return '#dcfce7'; // bg-green-100
      case 'booked': return '#fef9c3'; // bg-yellow-100
      case 'completed': return '#dcfce7'; // bg-green-100
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

      {/* Actions en haut à droite */}
      <div className="agenda-actions">
        {slot.status === 'available' && !isPast && (
          <button 
            className="agenda-edit-btn"
            onClick={() => onEdit(slot)}
            title="Modifier"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        )}

        {slot.status === 'booked' && !isPast && (
          <button 
            className="agenda-start-btn"
            onClick={() => onStartInterview(slot)}
            title="Démarrer"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        )}

        {!isPast && (
          <button 
            className="agenda-delete-btn"
            onClick={() => onDelete(slot)}
            title="Supprimer"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

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
            style={{ 
              backgroundColor: getStatusBackgroundColor(slot.status),
              color: getStatusColor(slot.status)
            }}
          >
            {getStatusText(slot.status)}
          </span>
        </div>
      </div>

      <div className="agenda-card-content">
        <div className="agenda-card-time">
          <FontAwesomeIcon icon={faClock} />
          <span className="time-range">
            {slot.start_time_display && slot.end_time_display ? 
              `${slot.start_time_display} - ${slot.end_time_display}` :
              `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
            }
          </span>
        </div>

        <div className="agenda-card-date">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>{formatDate(slot.date)}</span>
        </div>


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
              Rejoindre la réunion
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;
