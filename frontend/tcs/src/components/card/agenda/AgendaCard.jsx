import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faPhone, 
  faClock, 
  faCalendarAlt,
  faEdit,
  faTrash,
  faVideoCamera,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { formatTimeForUser } from '../../../utils/timezoneUtils';
import { useAuth } from '../../../context/AuthContext';
import { Badge, Button, Card } from '../../common';
import ZoomService from '../../../services/ZoomService';
import './AgendaCard.css';

const AgendaCard = ({ 
  slot, 
  onEdit, 
  onDelete, 
  onStartInterview,
  onCreateMeetingLink,
  onJoinMeeting,
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

  const handleCreateMeetingLink = () => {
    if (onCreateMeetingLink) {
      onCreateMeetingLink(slot);
    }
  };

  const canCreateMeetingLink = () => {
    return slot.type === 'video' && 
           slot.status === 'booked' && 
           slot.candidate && 
           !slot.meeting_link &&
           !isPast;
  };

  const canJoinMeeting = () => {
    return slot.meeting_link && 
           slot.status === 'booked' && 
           !isPast &&
           user && // Vérifier que user existe
           (user.id === slot.recruiter?.id || user.id === slot.candidate?.id);
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
        <button 
          className="agenda-edit-btn"
          onClick={() => onEdit(slot)}
          title="Modifier"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        <button 
          className="agenda-delete-btn"
          onClick={() => onDelete(slot)}
          title="Supprimer"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
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
          <Badge type="status" variant={slot.status}>
            {getStatusText(slot.status)}
          </Badge>
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

        {/* Section Jitsi Meeting */}
        {slot.type === 'video' && (
          <div className="agenda-card-meeting">
            {slot.meeting_link ? (
              <div className="meeting-link-section">
                <div className="meeting-link-header">
                  <a 
                    href={slot.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meeting-link-text"
                    title="Rejoindre la réunion"
                  >
                    Rejoindre réunion
                  </a>
                </div>
              </div>
            ) : canCreateMeetingLink() && (
              <div className="create-meeting-section">
                <div className="create-meeting-header">
                  <FontAwesomeIcon icon={faVideoCamera} style={{ color: '#6b7280' }} />
                  <span className="meeting-label">Aucun lien de réunion</span>
                </div>
                
                <button 
                  className="create-meeting-btn"
                  onClick={handleCreateMeetingLink}
                  title="Créer un lien de visioconférence"
                >
                  <FontAwesomeIcon icon={faVideoCamera} />
                  Créer le lien
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;
