import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faVideoCamera, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import JitsiMeetComponent from './JitsiMeetComponent';
import './JitsiMeetingModal.css';

const JitsiMeetingModal = ({ 
  isOpen, 
  onClose, 
  slot, 
  meetingConfig = null 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !slot) {
    return null;
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMeetingEnd = () => {
    setIsFullscreen(false);
    onClose();
  };

  const meetingId = meetingConfig?.meeting_id || slot.meeting_link?.split('/').pop() || `tcs-meeting-${slot.id}`;

  return (
    <div className={`jitsi-modal-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="jitsi-modal">
        {/* Header */}
        <div className="jitsi-modal-header">
          <div className="modal-title">
            <FontAwesomeIcon icon={faVideoCamera} />
            <span>Entretien vidéo - {slot.type === 'video' ? 'Visioconférence' : 'Téléphone'}</span>
          </div>
          
          <div className="modal-actions">
            <button 
              className="modal-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Réduire' : 'Plein écran'}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
            
            <button 
              className="modal-btn close-btn"
              onClick={onClose}
              title="Fermer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="meeting-info">
          <div className="meeting-details">
            <div className="detail-item">
              <strong>Date :</strong> {new Date(slot.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="detail-item">
              <strong>Heure :</strong> {slot.start_time} - {slot.end_time}
            </div>
            {slot.candidate && (
              <div className="detail-item">
                <strong>Candidat :</strong> {slot.candidate.first_name} {slot.candidate.last_name}
              </div>
            )}
            {slot.recruiter && (
              <div className="detail-item">
                <strong>Recruteur :</strong> {slot.recruiter.first_name} {slot.recruiter.last_name}
              </div>
            )}
          </div>
        </div>

        {/* Jitsi Component */}
        <div className="jitsi-wrapper">
          <JitsiMeetComponent
            meetingId={meetingId}
            config={meetingConfig?.config_overwrite || {}}
            onMeetingEnd={handleMeetingEnd}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            className="modal-jitsi"
          />
        </div>
      </div>
    </div>
  );
};

export default JitsiMeetingModal;
