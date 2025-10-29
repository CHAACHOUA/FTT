/**
 * Utilitaires pour la gestion des fuseaux horaires côté frontend
 */

/**
 * Convertit une heure UTC vers le fuseau horaire de l'utilisateur
 * @param {string|Date} time - Heure à convertir
 * @param {string} userTimezone - Fuseau horaire de l'utilisateur
 * @param {string} date - Date (optionnelle)
 * @returns {string} Heure formatée dans le fuseau horaire de l'utilisateur
 */
export const formatTimeForUser = (time, userTimezone, date = null) => {
  try {
    let dateTime;
    
    if (typeof time === 'string') {
      // Si c'est une chaîne de temps (HH:MM:SS), créer une date complète
      if (date) {
        dateTime = new Date(`${date}T${time}`);
      } else {
        dateTime = new Date(time);
      }
    } else if (time instanceof Date) {
      dateTime = time;
    } else {
      return time.toString();
    }
    
    // Convertir vers le fuseau horaire de l'utilisateur
    return dateTime.toLocaleTimeString('fr-FR', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors de la conversion du fuseau horaire:', error);
    return time.toString();
  }
};

/**
 * Convertit une date/heure vers le fuseau horaire de l'utilisateur
 * @param {string|Date} dateTime - Date/heure à convertir
 * @param {string} userTimezone - Fuseau horaire de l'utilisateur
 * @returns {string} Date/heure formatée dans le fuseau horaire de l'utilisateur
 */
export const formatDateTimeForUser = (dateTime, userTimezone) => {
  try {
    const date = new Date(dateTime);
    
    return date.toLocaleString('fr-FR', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors de la conversion de la date/heure:', error);
    return dateTime.toString();
  }
};

/**
 * Obtient l'heure actuelle dans le fuseau horaire de l'utilisateur
 * @param {string} userTimezone - Fuseau horaire de l'utilisateur
 * @returns {string} Heure actuelle formatée
 */
export const getCurrentTimeInTimezone = (userTimezone) => {
  try {
    const now = new Date();
    return now.toLocaleString('fr-FR', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors de l\'obtention de l\'heure actuelle:', error);
    return new Date().toLocaleString('fr-FR');
  }
};

/**
 * Vérifie si un fuseau horaire est valide
 * @param {string} timezone - Fuseau horaire à vérifier
 * @returns {boolean} True si valide, False sinon
 */
export const isValidTimezone = (timezone) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtient le décalage horaire d'un fuseau horaire par rapport à UTC
 * @param {string} timezone - Fuseau horaire
 * @returns {number} Décalage en heures
 */
export const getTimezoneOffset = (timezone) => {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
  } catch (error) {
    console.error('Erreur lors du calcul du décalage horaire:', error);
    return 0;
  }
};

/**
 * Formate un créneau d'agenda avec gestion des fuseaux horaires
 * @param {Object} slot - Créneau d'agenda
 * @param {string} userTimezone - Fuseau horaire de l'utilisateur
 * @returns {Object} Créneau formaté
 */
export const formatAgendaSlot = (slot, userTimezone) => {
  console.log('🔍 formatAgendaSlot - slot:', slot);
  console.log('🔍 formatAgendaSlot - userTimezone:', userTimezone);
  
  if (!slot || !userTimezone) {
    console.log('⚠️ formatAgendaSlot - Paramètres invalides, retour du slot original');
    return slot;
  }
  
  try {
    // Ne pas convertir les heures si elles sont déjà dans le bon format
    // Les heures sont stockées en local time dans la base de données
    const formattedSlot = {
      ...slot,
      start_time_display: slot.start_time, // Utiliser directement l'heure stockée
      end_time_display: slot.end_time,     // Utiliser directement l'heure stockée
      timezone_info: {
        user_timezone: userTimezone,
        offset: getTimezoneOffset(userTimezone)
      }
    };
    console.log('✅ formatAgendaSlot - slot formaté:', formattedSlot);
    return formattedSlot;
  } catch (error) {
    console.error('❌ Erreur lors du formatage du créneau:', error);
    return slot;
  }
};

/**
 * Formate une liste de créneaux d'agenda
 * @param {Array} slots - Liste des créneaux
 * @param {string} userTimezone - Fuseau horaire de l'utilisateur
 * @returns {Array} Liste des créneaux formatés
 */
export const formatAgendaSlots = (slots, userTimezone) => {
  console.log('🔍 formatAgendaSlots - slots:', slots);
  console.log('🔍 formatAgendaSlots - userTimezone:', userTimezone);
  
  if (!Array.isArray(slots) || !userTimezone) {
    console.log('⚠️ formatAgendaSlots - Paramètres invalides, retour des slots originaux');
    return slots;
  }
  
  const formattedSlots = slots.map(slot => formatAgendaSlot(slot, userTimezone));
  console.log('✅ formatAgendaSlots - slots formatés:', formattedSlots);
  return formattedSlots;
};

/**
 * Obtient les fuseaux horaires disponibles
 * @returns {Array} Liste des fuseaux horaires avec leurs labels
 */
export const getAvailableTimezones = () => {
  return [
    ['Europe/Paris', 'Europe/Paris (UTC+1/+2)'],
    ['Europe/London', 'Europe/London (UTC+0/+1)'],
    ['Europe/Berlin', 'Europe/Berlin (UTC+1/+2)'],
    ['Europe/Rome', 'Europe/Rome (UTC+1/+2)'],
    ['Europe/Madrid', 'Europe/Madrid (UTC+1/+2)'],
    ['America/New_York', 'America/New_York (UTC-5/-4)'],
    ['America/Los_Angeles', 'America/Los_Angeles (UTC-8/-7)'],
    ['America/Chicago', 'America/Chicago (UTC-6/-5)'],
    ['Asia/Tokyo', 'Asia/Tokyo (UTC+9)'],
    ['Asia/Shanghai', 'Asia/Shanghai (UTC+8)'],
    ['Asia/Dubai', 'Asia/Dubai (UTC+4)'],
    ['Australia/Sydney', 'Australia/Sydney (UTC+10/+11)'],
    ['UTC', 'UTC (UTC+0)']
  ];
};
