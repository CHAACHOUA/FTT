import React, { useState } from 'react';
import { FaClock, FaCalendar, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VirtualSlotSelection.css';

const VirtualSlotSelection = ({ 
  slots, 
  onSelect, 
  onSkip 
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // Si c'est juste l'heure (ex: "09:00:00"), la formater directement
    if (timeString && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    // Sinon, essayer de parser comme une date complète
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlotDuration = (startTime, endTime) => {
    // Si ce sont des heures (ex: "09:00:00"), calculer la différence
    if (startTime && endTime && startTime.includes(':') && endTime.includes(':')) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diffMs = end - start;
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return diffMinutes;
    }
    // Sinon, essayer de parser comme des dates complètes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return diffMinutes;
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      // Utiliser slot.date au lieu de slot.start_time pour grouper par date
      const date = new Date(slot.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (selectedSlot) {
      onSelect(selectedSlot);
    } else {
      toast.error('Veuillez sélectionner un créneau');
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="slot-selection-step">
        <div className="no-slots">
          <FaClock className="no-slots-icon" />
          <h3>Aucun créneau disponible</h3>
          <p>Il n'y a actuellement aucun créneau disponible pour cette offre.</p>
          <button className="btn-primary" onClick={onSkip}>
            Continuer sans créneau
          </button>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <div className="slot-selection-step">
      <div className="slot-selection-header">
        <h3>Sélection du créneau</h3>
        <p>Choisissez un créneau disponible pour votre entretien</p>
        <div className="availability-info">
          <span className="available-indicator">✅</span>
          <span>Seuls les créneaux disponibles sont affichés</span>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaUser /> Liste
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <FaCalendar /> Calendrier
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="slots-list">
          {Object.entries(groupedSlots).map(([date, daySlots]) => (
            <div key={date} className="day-group">
              <h4>{formatDate(daySlots[0].date)}</h4>
              <div className="day-slots">
                {daySlots.map(slot => (
                  <div 
                    key={slot.id} 
                    className={`slot-item ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <div className="slot-time">
                      <FaClock />
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </div>
                    <div className="slot-duration">
                      {getSlotDuration(slot.start_time, slot.end_time)} min
                    </div>
                    <div className="slot-type">
                      {slot.slot_type || 'Entretien'}
                    </div>
                    {slot.recruiter && (
                      <div className="slot-recruiter">
                        <FaUser />
                        {slot.recruiter.first_name} {slot.recruiter.last_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="slots-calendar">
          {/* Version simplifiée du calendrier */}
          <div className="calendar-grid">
            {Object.entries(groupedSlots).map(([date, daySlots]) => (
              <div key={date} className="calendar-day">
                <div className="day-header">
                  {formatDate(daySlots[0].date)}
                </div>
                <div className="day-slots">
                  {daySlots.map(slot => (
                    <div 
                      key={slot.id} 
                      className={`calendar-slot ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                      onClick={() => handleSlotClick(slot)}
                    >
                      {formatTime(slot.start_time)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="selected-slot-info">
          <h4>Créneau sélectionné :</h4>
          <div className="slot-details">
            <p><strong>Date :</strong> {formatDate(selectedSlot.date)}</p>
            <p><strong>Heure :</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
            <p><strong>Durée :</strong> {getSlotDuration(selectedSlot.start_time, selectedSlot.end_time)} minutes</p>
            {selectedSlot.recruiter && (
              <p><strong>Recruteur :</strong> {selectedSlot.recruiter.first_name} {selectedSlot.recruiter.last_name}</p>
            )}
          </div>
        </div>
      )}

      <div className="slot-actions">
        <button className="btn-secondary" onClick={handleSkip}>
          <FaTimes /> Continuer sans créneau
        </button>
        <button 
          className="btn-primary" 
          onClick={handleConfirm}
          disabled={!selectedSlot}
        >
          <FaCheck /> Confirmer le créneau
        </button>
      </div>
    </div>
  );
};

export default VirtualSlotSelection;
