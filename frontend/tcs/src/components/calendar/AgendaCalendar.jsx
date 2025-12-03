import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faVideo,
  faPhone,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { formatTimeForUser } from '../../utils/timezoneUtils';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Card, Input } from '../common';

const normalizeTimeString = (timeStr = '') => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hours = (parts[0] || '00').padStart(2, '0');
  const minutes = (parts[1] || '00').padStart(2, '0');
  const seconds = (parts[2] || '00').padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const getFormattedSlotTime = (timeStr, slotDate, timezone) => {
  if (!timeStr) return '--:--';
  const normalized = normalizeTimeString(timeStr);
  const formatted = formatTimeForUser(normalized, timezone || 'Europe/Paris', slotDate);
  if (!formatted || formatted.toString().includes('Invalid')) {
    return normalized.slice(0, 5);
  }
  return formatted;
};

const AgendaCalendar = ({ 
  timeSlots: agendaSlots = [], 
  onDateClick, 
  onSlotClick, 
  onAddSlot,
  selectedDate,
  interviewStartDate,
  interviewEndDate
}) => {
  const { user } = useAuth();
  
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    duration: 15,
    type: 'video',
    startTime: '',
    endTime: '',
    date: ''
  });

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Générer les données du calendrier avec useMemo pour éviter les recalculs
  const calendarData = useMemo(() => {
    if (!interviewStartDate || !interviewEndDate) return [];

    const startDate = new Date(interviewStartDate);
    const endDate = new Date(interviewEndDate);
    
    // Trouver le lundi de la semaine courante
    const monday = new Date(currentWeek);
    monday.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    // Générer UNE SEULE semaine (celle de currentWeek)
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dateStr = dayDate.toISOString().split('T')[0];
      
      // Vérifier si ce jour est dans la période d'entretiens
      if (dayDate >= startDate && dayDate <= endDate) {
        const daySlots = agendaSlots.filter(slot => slot.date === dateStr);
        
        weekDays.push({
          date: dayDate,
          dateStr,
          isInPeriod: true,
          isToday: isToday(dayDate),
          isSelected: selectedDate === dateStr,
          slots: daySlots
        });
      } else {
        weekDays.push({
          date: dayDate,
          dateStr,
          isInPeriod: false,
          isToday: false,
          isSelected: false,
          slots: []
        });
      }
    }
    
    // Ne retourner qu'une seule semaine
    return [{
      weekStart: new Date(monday),
      days: weekDays
    }];
  }, [currentWeek, interviewStartDate, interviewEndDate, selectedDate, agendaSlots]);

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (day.isInPeriod) {
      onDateClick(day.dateStr);
      // Toggle selection
      setSelectedDates(prev => {
        const newSet = new Set(prev);
        if (newSet.has(day.dateStr)) {
          newSet.delete(day.dateStr);
        } else {
          newSet.add(day.dateStr);
        }
        return newSet;
      });
    }
  };

  const handleCellClick = (day, timeSlot, event) => {
    // Simple clic : ne pas déclencher la sélection
    event.stopPropagation();
    console.log('Cell clicked:', day.dateStr, timeSlot.display);
  };

  const handleSlotClick = (slot, event) => {
    event.stopPropagation();
    onSlotClick(slot);
  };

  // Gestion de la sélection de plage horaire
  const handleMouseDown = (day, timeSlot, event) => {
    if (!day.isInPeriod) return;
    
    // Démarrer la sélection seulement si c'est un clic maintenu (pas un simple clic)
    event.preventDefault();
    setIsSelecting(true);
    setSelectionStart({ day, timeSlot });
    setSelectionEnd({ day, timeSlot });
  };

  const handleMouseEnter = (day, timeSlot) => {
    if (!isSelecting || !day.isInPeriod) return;
    setSelectionEnd({ day, timeSlot });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    if (selectionStart && selectionEnd) {
      // Vérifier si c'est vraiment un drag (pas juste un clic)
      const isDrag = selectionStart.day.dateStr !== selectionEnd.day.dateStr || 
                     selectionStart.timeSlot.hour !== selectionEnd.timeSlot.hour;
      
      if (isDrag) {
        // Ouvrir la popup de configuration seulement pour le drag & drop
        const startTime = selectionStart.timeSlot.display;
        const endTime = selectionEnd.timeSlot.display;
        
        setNewSlot({
          duration: 15,
          type: 'video',
          startTime,
          endTime,
          date: selectionStart.day.dateStr
        });
        
        setShowSlotModal(true);
      }
    }
    
    setSelectionStart(null);
    setSelectionEnd(null);
  };




  const createTimeSlotsWithDuration = () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.date || !newSlot.duration) {
      toast.error('Veuillez sélectionner une plage horaire et une durée valides');
      return;
    }

    const [startHour, startMinute] = newSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = newSlot.endTime.split(':').map(Number);

    if (
      [startHour, startMinute, endHour, endMinute].some(
        value => Number.isNaN(value) || value < 0
      )
    ) {
      toast.error('Heures de début ou de fin invalides');
      return;
    }

    const duration = parseInt(newSlot.duration, 10);
    if (Number.isNaN(duration) || duration <= 0) {
      toast.error('Durée invalide');
      return;
    }

    const date = newSlot.date;
    const type = newSlot.type;
  
    const slots = [];
  
    let currentMinutes = startHour * 60 + startMinute;
    let endMinutes = endHour * 60 + endMinute;

    // Permettre la sélection inversée (glisser du bas vers le haut)
    if (endMinutes < currentMinutes) {
      [currentMinutes, endMinutes] = [endMinutes, currentMinutes];
    }

    if (endMinutes === currentMinutes) {
      toast.error('La plage horaire sélectionnée doit être supérieure à 0 minute');
      return;
    }
  
    while (currentMinutes < endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMinute = currentMinutes % 60;
  
      let slotEndMinutes = currentMinutes + duration;
      if (slotEndMinutes > endMinutes) slotEndMinutes = endMinutes;
  
      // Stop si créneau nul
      if (slotEndMinutes <= currentMinutes) break;
  
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMinute = slotEndMinutes % 60;
  
      slots.push({
        id: Date.now() + Math.random(),
        date,
        start_time: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
        end_time: `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`,
        type,
        duration: slotEndMinutes - currentMinutes,
        status: 'available'
      });
  
      currentMinutes = slotEndMinutes; // avancer
    }
  
    slots.forEach(slot => onAddSlot(slot));
  
    if (slots.length > 0) {
      toast.success(`${slots.length} créneau(x) créé(s) avec succès`);
    }
  };
  
  const handleCreateSlot = () => {
    // Créer les créneaux selon la configuration de la popup
    createTimeSlotsWithDuration();
    setShowSlotModal(false);
  };
  const getSlotIcon = (type) => {
    return type === 'video' ? faVideo : faPhone;
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'booked': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startStr = weekStart.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short'
    });
    const endStr = weekEnd.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    return `${startStr} - ${endStr}`;
  };

  
  // Générer les heures de la journée (8h à 18h)
  const PIXELS_PER_MINUTE = 2;
  const CELL_INTERVAL_MINUTES = 5;

  const generateTimeSlots = () => {
    const hours = [];
    for (let hour = 8; hour <= 18; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      hours.push({
        hour,
        display: `${hourStr}:00`
      });
    }
    return hours;
  };

  const hourSlots = generateTimeSlots();
  

  return (
    <div className="agenda-calendar-container">
      {/* Header du calendrier */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateWeek(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <h3 className="calendar-title">
            {calendarData.length > 0 ? formatWeekRange(calendarData[0].weekStart) : 'Période d\'entretiens'}
          </h3>
          
          <button 
            className="nav-btn"
            onClick={() => navigateWeek(1)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Grille du calendrier avec horaires */}
      <div className="calendar-grid-with-time">
        {/* Colonne des heures */}
        <div className="time-column">
          <div className="time-header"></div>
          {hourSlots.map((timeSlot, index) => (
            <div key={index} className="time-slot">
              {timeSlot.display}
            </div>
          ))}
        </div>

        {/* Grille principale */}
        <div className="calendar-main-grid">

          {/* CORRECTION: Afficher UNE SEULE semaine */}
          {calendarData.length > 0 && (
            <div className="calendar-week-with-time">
              {calendarData[0].days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`calendar-day-with-time ${!day.isInPeriod ? 'outside-period' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''} ${selectedDates.has(day.dateStr) ? 'multi-selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="day-header">
                    <div className="day-number">
                      {day.date.getDate()}
                    </div>
                    <div className="day-month">
                      {day.date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  
                  {/* Grille horaire pour ce jour */}
                  <div className="day-time-grid">
                    {hourSlots.map((timeSlot, timeIndex) => {
                      const minuteIntervals = Array.from(
                        { length: 60 / CELL_INTERVAL_MINUTES },
                        (_, idx) => idx * CELL_INTERVAL_MINUTES
                      );
                      
                      return minuteIntervals.map((quarterMinute, quarterIndex) => {
                        const quarterTime = {
                          hour: timeSlot.hour,
                          minute: quarterMinute,
                          display: `${timeSlot.hour.toString().padStart(2, '0')}:${quarterMinute.toString().padStart(2, '0')}`
                        };
                        
                        // Trouver les créneaux pour ce quart d'heure
                        const slotsForQuarter = day.slots.filter(slot => {
                          const timeToUse = slot.start_time_display || slot.start_time;
                          const slotHour = parseInt(timeToUse.split(':')[0]);
                          const slotMinute = parseInt(timeToUse.split(':')[1]);
                          return slotHour === timeSlot.hour && slotMinute === quarterMinute;
                        });
                        
                        return (
                          <div
                            key={`${timeIndex}-${quarterIndex}`}
                            className={`time-cell ${
                              quarterMinute === 0
                                ? 'hour-boundary'
                                : quarterMinute % 15 === 0
                                  ? 'quarter-boundary'
                                  : ''
                            }`}
                            style={{ height: `${CELL_INTERVAL_MINUTES * PIXELS_PER_MINUTE}px` }}
                            onClick={(e) => handleCellClick(day, quarterTime, e)}
                            onMouseDown={(e) => handleMouseDown(day, quarterTime, e)}
                            onMouseEnter={() => handleMouseEnter(day, quarterTime)}
                            onMouseUp={handleMouseUp}
                          >
                            {slotsForQuarter.map((slot, slotIndex) => {
                              const startTime = slot.start_time_display || slot.start_time;
                              const endTime = slot.end_time_display || slot.end_time;
                              const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
                              const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
                              const duration = Math.max(endMinutes - startMinutes, 0);
                              
                              const cellStartMinute = quarterMinute;
                              const relativeStart = Math.max(parseInt(startTime.split(':')[1]) - cellStartMinute, 0);
                              const topPosition = relativeStart * PIXELS_PER_MINUTE;
                              const height = Math.max(duration * PIXELS_PER_MINUTE, CELL_INTERVAL_MINUTES * PIXELS_PER_MINUTE * 0.4);
                              
                              return (
                                <div
                                  key={slotIndex}
                                  className="time-slot-event"
                                  style={{ 
                                    borderColor: getSlotColor(slot.status),
                                    color: getSlotColor(slot.status),
                                    top: `${topPosition}px`,
                                    height: `${height}px`
                                  }}
                                  onClick={(e) => handleSlotClick(slot, e)}
                                  data-duration={duration}
                                >
                                  <FontAwesomeIcon 
                                    icon={getSlotIcon(slot.type)} 
                                    className="slot-icon"
                                    style={{ color: getSlotColor(slot.status) }}
                                  />
                                  <span className="slot-time">
                                  {getFormattedSlotTime(startTime, slot.date || day.dateStr, user?.timezone)} - {getFormattedSlotTime(endTime, slot.date || day.dateStr, user?.timezone)}

                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Réservé</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#6b7280' }}></div>
          <span>Terminé</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Annulé</span>
        </div>
      </div>

      {/* Popup de configuration de créneau (pour drag & drop) */}
      {showSlotModal && (
        <div className="slot-modal-overlay">
          <div className="slot-modal-content">
            <h3>Créer des créneaux</h3>
            
            <div className="modal-section">
              <label>Plage horaire sélectionnée :</label>
              <div className="time-range-display">
                {newSlot.startTime} - {newSlot.endTime}
              </div>
            </div>

            <div className="modal-section">
              <label>Durée par créneau :</label>
              <div className="duration-options">
                <button 
                  className={`duration-btn ${newSlot.duration === 10 ? 'active' : ''}`}
                  onClick={() => setNewSlot(prev => ({ ...prev, duration: 10 }))}
                >
                  10 min
                </button>
                <button 
                  className={`duration-btn ${newSlot.duration === 15 ? 'active' : ''}`}
                  onClick={() => setNewSlot(prev => ({ ...prev, duration: 15 }))}
                >
                  15 min
                </button>
                <button 
                  className={`duration-btn ${newSlot.duration === 30 ? 'active' : ''}`}
                  onClick={() => setNewSlot(prev => ({ ...prev, duration: 30 }))}
                >
                  30 min
                </button>
              </div>
            </div>

            <div className="modal-section">
              <label>Type d'entretien :</label>
              <div className="type-options">
                <button 
                  className={`type-btn ${newSlot.type === 'video' ? 'active' : ''}`}
                  onClick={() => setNewSlot(prev => ({ ...prev, type: 'video' }))}
                >
                  <FontAwesomeIcon icon={faVideo} />
                  Visioconférence
                </button>
                <button 
                  className={`type-btn ${newSlot.type === 'phone' ? 'active' : ''}`}
                  onClick={() => setNewSlot(prev => ({ ...prev, type: 'phone' }))}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  Téléphone
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowSlotModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm"
                onClick={handleCreateSlot}
              >
                Créer les créneaux
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaCalendar;