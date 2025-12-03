import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { FaClock, FaCalendar, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VirtualSlotSelection.css';

const VirtualSlotSelection = ({ 
  slots, 
  offer,
  onSelect, 
  onSkip,
  hideActions = false
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Filtrer les slots pour l'offre spécifique
  const filteredSlots = React.useMemo(() => {
    if (!slots || !offer) return slots || [];
    
    console.log('🔍 [SLOTS] Filtering slots for offer:', offer.id, offer.title);
    console.log('🔍 [SLOTS] Total slots before filtering:', slots.length);
    
    // Filtrer les slots qui appartiennent aux recruteurs de l'entreprise de l'offre
    const filtered = slots.filter(slot => {
      // Vérifier si le slot appartient à un recruteur de la même entreprise que l'offre
      const slotCompanyId = slot.recruiter?.company?.id;
      const offerCompanyId = offer.company?.id;
      
      console.log('🔍 [SLOTS] Slot details:', {
        slotId: slot.id,
        slotRecruiter: slot.recruiter,
        slotCompany: slot.recruiter?.company,
        offerCompany: offer.company,
        slotCompanyId,
        offerCompanyId,
        match: slotCompanyId === offerCompanyId
      });
      
      return slotCompanyId === offerCompanyId;
    });
    
    console.log('🔍 [SLOTS] Filtered slots count:', filtered.length);
    return filtered;
  }, [slots, offer]);

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
    filteredSlots.forEach(slot => {
      // Utiliser slot.date au lieu de slot.start_time pour grouper par date
      const date = new Date(slot.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    // Trier les slots par heure dans chaque groupe
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
    });
    return grouped;
  };

  const handleSlotClick = (slot) => {
    // Si le créneau est déjà sélectionné, le désélectionner
    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
      // Si hideActions est true, appeler onSelect avec null pour désélectionner
      if (hideActions) {
        onSelect(null);
      }
    } else {
      setSelectedSlot(slot);
      // Si hideActions est true, appeler automatiquement onSelect pour sauvegarder la sélection
      if (hideActions) {
        onSelect(slot);
      }
    }
  };


  const handleConfirm = () => {
    if (selectedSlot) {
      console.log('🔍 [SLOT] Selected slot:', selectedSlot);
      onSelect(selectedSlot);
    } else {
      toast.error('Veuillez sélectionner un créneau');
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!filteredSlots || filteredSlots.length === 0) {
    return (
      <div className="slot-selection-step">
        <div className="no-slots">
          <FaClock className="no-slots-icon" />
          <h3>Aucun créneau disponible</h3>
          <p>Il n'y a actuellement aucun créneau disponible pour cette offre.</p>
          {!hideActions && (
            <button className="btn-primary" onClick={onSkip}>
              Continuer sans créneau
            </button>
          )}
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
      </div>

      <div className="slots-cards-container">
        {Object.entries(groupedSlots).map(([date, daySlots]) => {
          const dayName = formatDate(daySlots[0].date);
          
          return (
            <div key={date} className="slots-day-section">
              <h4 className="slots-day-title">{dayName}</h4>
              <div className="slots-cards-grid">
                {daySlots.map(slot => (
                  <div 
                    key={slot.id} 
                    className={`slot-card ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <div className="slot-card-header">
                      <div className="slot-time">
                        <FaClock />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <div className="slot-duration">
                        {getSlotDuration(slot.start_time, slot.end_time)} min
                      </div>
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
          );
        })}
      </div>

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

      {!hideActions && (
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
      )}
    </div>
  );
};

export default VirtualSlotSelection;
