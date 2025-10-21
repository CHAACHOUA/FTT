import React, { useState, useEffect } from 'react';
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

const AgendaCalendar = ({ 
  timeSlots: agendaSlots = [], 
  onDateClick, 
  onSlotClick, 
  onAddSlot,
  selectedDate,
  interviewStartDate,
  interviewEndDate
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
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

  // Générer les données du calendrier
  useEffect(() => {
    generateCalendarData();
  }, [currentWeek, agendaSlots, interviewStartDate, interviewEndDate]);

  const generateCalendarData = () => {
    if (!interviewStartDate || !interviewEndDate) return;

    const startDate = new Date(interviewStartDate);
    const endDate = new Date(interviewEndDate);
    
    // Trouver le lundi de la semaine courante
    const monday = new Date(currentWeek);
    monday.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    // CORRECTION: Générer UNE SEULE semaine (celle de currentWeek)
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
    
    // CORRECTION: Ne retourner qu'une seule semaine
    setCalendarData([{
      weekStart: new Date(monday),
      days: weekDays
    }]);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

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

  const handleAddSingleSlot = () => {
    // Créer un créneau unique de 30 min à l'heure actuelle
    const now = new Date();
    const currentHour = now.getHours();
    
    const startTime = `${currentHour.toString().padStart(2, '0')}:00`;
    const endTime = `${currentHour.toString().padStart(2, '0')}:30`;
    
    const slot = {
      id: Date.now() + Math.random(),
      date: now.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      type: 'video',
      duration: 30,
      status: 'available'
    };
    
    onAddSlot(slot);
  };

  const handleCreateSlot = () => {
    // Créer les créneaux selon la configuration de la popup
    createTimeSlotsWithDuration();
    setShowSlotModal(false);
  };

  const createTimeSlotsWithDuration = () => {
    const startHour = parseInt(newSlot.startTime.split(':')[0]);
    const endHour = parseInt(newSlot.endTime.split(':')[0]);
    const date = newSlot.date;
    const duration = newSlot.duration;
    const type = newSlot.type;
    
    const slots = [];
    
    // CORRECTION: Créer des créneaux selon la durée sélectionnée dans la popup
    for (let hour = startHour; hour <= endHour; hour++) {
      // Calculer le nombre de créneaux par heure selon la durée choisie
      const slotsPerHour = 60 / duration; // 60 minutes divisées par la durée
      
      for (let i = 0; i < slotsPerHour; i++) {
        const startMinutes = i * duration;
        const endMinutes = startMinutes + duration;
        
        // Ne pas créer de créneaux au-delà de l'heure de fin
        if (hour === endHour && startMinutes >= 60) {
          break;
        }
        
        const startTime = `${hour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
        
        let endTime;
        if (endMinutes >= 60) {
          // Le créneau se termine à l'heure suivante
          const nextHour = hour + 1;
          const remainingMinutes = endMinutes - 60;
          endTime = `${nextHour.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
        } else {
          endTime = `${hour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        }
        
        // Ne pas créer de créneaux au-delà de l'heure de fin
        if (hour > endHour || (hour === endHour && startMinutes >= 60)) {
          break;
        }
        
        slots.push({
          id: Date.now() + Math.random() + i,
          date,
          start_time: startTime,
          end_time: endTime,
          type,
          duration, // Utiliser la durée sélectionnée
          status: 'available'
        });
      }
    }
    
    // Créer tous les créneaux
    slots.forEach(slot => {
      onAddSlot(slot);
    });
    
    // Afficher une seule notification pour tous les créneaux créés
    if (slots.length > 0) {
      toast.success(`${slots.length} créneau(x) créé(s) avec succès`);
    }
  };

  const createTimeSlotsAutomatically = (start, end) => {
    const startHour = start.timeSlot.hour;
    const endHour = end.timeSlot.hour;
    const date = start.day.dateStr;
    const duration = 30; // Durée par défaut de 30 minutes (bloc unifié)
    const type = 'video'; // Type par défaut
    
    const slots = [];
    
    // CORRECTION: Créer des blocs unifiés de 30 minutes (9h-9h30, 9h30-10h, etc.)
    for (let hour = startHour; hour <= endHour; hour++) {
      // Créer 2 blocs de 30 minutes par heure (00-30 et 30-60)
      const timeBlocks = [
        { start: '00', end: '30' },
        { start: '30', end: '00' } // 30-60 devient 30-00 de l'heure suivante
      ];
      
      timeBlocks.forEach((timeBlock, index) => {
        const startTime = `${hour.toString().padStart(2, '0')}:${timeBlock.start}`;
        let endTime;
        
        if (timeBlock.end === '00') {
          // 30-60 devient 30-00 de l'heure suivante
          endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        } else {
          endTime = `${hour.toString().padStart(2, '0')}:${timeBlock.end}`;
        }
        
        // Ne pas créer de bloc au-delà de l'heure de fin
        if (hour === endHour && timeBlock.start === '30') {
          return; // Skip le bloc 30-60 de la dernière heure
        }
        
        slots.push({
          id: Date.now() + Math.random() + index,
          date,
          start_time: startTime,
          end_time: endTime,
          type,
          duration,
          status: 'available'
        });
      });
    }
    
    // Créer tous les créneaux automatiquement
    slots.forEach(slot => {
      onAddSlot(slot);
    });
    
    // Afficher une seule notification pour tous les créneaux créés
    if (slots.length > 0) {
      toast.success(`${slots.length} créneau(x) créé(s) avec succès`);
    }
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

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Générer les heures de la journée (8h à 20h)
  const generateTimeSlots = () => {
    const hours = [];
    for (let hour = 8; hour <= 20; hour++) {
      hours.push({
        hour,
        display: `${hour.toString().padStart(2, '0')}:00`
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
        
            <button
              className="add-slot-btn"
              onClick={() => handleAddSingleSlot()}
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter un créneau
            </button>
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
          {/* En-têtes des jours de la semaine */}
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

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
                      // Trouver les créneaux pour cette heure
                      const slotsForHour = day.slots.filter(slot => {
                        const slotHour = parseInt(slot.start_time.split(':')[0]);
                        return slotHour === timeSlot.hour;
                      });

                      return (
                            <div
                              key={timeIndex}
                              className="time-cell"
                              onClick={(e) => handleCellClick(day, timeSlot, e)}
                              onMouseDown={(e) => handleMouseDown(day, timeSlot, e)}
                              onMouseEnter={() => handleMouseEnter(day, timeSlot)}
                              onMouseUp={handleMouseUp}
                            >
                          {slotsForHour.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className="time-slot-event"
                              style={{ backgroundColor: getSlotColor(slot.status) }}
                              onClick={(e) => handleSlotClick(slot, e)}
                            >
                              <FontAwesomeIcon 
                                icon={getSlotIcon(slot.type)} 
                                className="slot-icon"
                              />
                              <span className="slot-time">
                                {slot.start_time}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
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
