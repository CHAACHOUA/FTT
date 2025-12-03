import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faMapMarkerAlt,
  faCalendarAlt,
  faCalendarDays,
  faUser,
  faVideo,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, Badge } from '../../common';
import { useUser } from '../../../hooks/useUser';
import axios from 'axios';
import './EventCard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const EventCard = ({
  event,
  onEdit,
  onDelete,
  showActions = true,
  showSpeaker = true,
  formatTime,
  formatDate,
  className = '',
  forumId
}) => {
  const { user, isOrganizer, isRecruiter, isCandidate } = useUser();
  const [isRegistered, setIsRegistered] = useState(event.is_registered || false);
  const [participantsCount, setParticipantsCount] = useState(event.participants_count || 0);
  const [loading, setLoading] = useState(false);
  
  // Debug: vérifier les valeurs
  useEffect(() => {
    console.log('🔍 [EventCard] Debug:', {
      isCandidate: isCandidate(),
      has_zoom_meeting: event.has_zoom_meeting,
      enable_zoom: event.enable_zoom,
      meeting_link: event.meeting_link,
      forumId,
      shouldShow: isCandidate() && (event.has_zoom_meeting || event.enable_zoom || event.meeting_link) && forumId
    });
  }, [event, forumId]);
  
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  const getImageUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith('http') 
      ? photo 
      : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${photo}`;
  };

  useEffect(() => {
    if (event.is_registered !== undefined) {
      setIsRegistered(event.is_registered);
    }
    if (event.participants_count !== undefined) {
      setParticipantsCount(event.participants_count);
    }
  }, [event.is_registered, event.participants_count]);

  const handleRegister = async () => {
    if (!forumId || !event.id) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/forums/${forumId}/programmes/${event.id}/register/`,
        {},
        { withCredentials: true }
      );
      setIsRegistered(true);
      setParticipantsCount(prev => prev + 1);
      if (onEdit) {
        // Rafraîchir l'événement si une fonction de callback est fournie
        const updatedEvent = { ...event, is_registered: true, participants_count: participantsCount + 1 };
        // Optionnel : appeler un callback pour mettre à jour la liste
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };


  const shouldShowZoomLink = () => {
    if (!event.meeting_link) return false;
    
    // Organizer et recruteurs voient toujours le lien
    if (isOrganizer() || isRecruiter()) {
      return true;
    }
    
    // Candidats : seulement s'ils sont inscrits ET 10 minutes avant le début
    if (isCandidate()) {
      if (!isRegistered) return false;
      
      const now = new Date();
      const startDate = new Date(`${event.start_date}T${event.start_time}`);
      const tenMinutesBefore = new Date(startDate.getTime() - 10 * 60 * 1000);
      return now >= tenMinutesBefore;
    }
    
    return false;
  };

  const handleZoomClick = (e) => {
    e.preventDefault();
    if (event.meeting_link) {
      window.open(event.meeting_link, '_blank');
    }
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
          {/* Titre avec bouton d'inscription */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 className="programme-title" style={{ margin: 0, flex: 1 }}>{event.title}</h4>
            {/* Bouton d'inscription pour les candidats - au niveau du titre */}
            {isCandidate() && (event.has_zoom_meeting || event.enable_zoom || event.meeting_link) && forumId && !isRegistered && (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="programme-register-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                  whiteSpace: 'nowrap',
                  marginLeft: '1rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span>{loading ? 'Inscription...' : "S'inscrire"}</span>
              </button>
            )}
            {/* Badge inscrit si déjà inscrit */}
            {isCandidate() && (event.has_zoom_meeting || event.enable_zoom || event.meeting_link) && forumId && isRegistered && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginLeft: '1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Inscrit</span>
              </div>
            )}
          </div>
          
          {/* Nombre de participants - sous le titre */}
          {isCandidate() && (event.has_zoom_meeting || event.enable_zoom || event.meeting_link) && forumId && (
            <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {participantsCount} participant{participantsCount > 1 ? 's' : ''} inscrit{participantsCount > 1 ? 's' : ''}
            </div>
          )}
          
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
          
          {/* Lien Zoom */}
          {shouldShowZoomLink() && (
            <div className="programme-zoom-link" style={{ marginTop: '1rem' }}>
              <a
                href={event.meeting_link}
                onClick={handleZoomClick}
                className="programme-zoom-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2D8CFF',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1E6FD9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2D8CFF'}
              >
                <FontAwesomeIcon icon={faVideo} />
                <span>Rejoindre la réunion Zoom</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
