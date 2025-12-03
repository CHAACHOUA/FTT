/**
 * Utilitaires pour la validation des dates
 */

/**
 * Valide que la date de début est antérieure à la date de fin
 * @param {string} startDate - Date de début (format YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format YYYY-MM-DD)
 * @returns {boolean} - true si valide, false sinon
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    console.log('validateDateRange: champs manquants');
    return false; // Les champs sont obligatoires
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const isValid = start <= end;
  console.log('validateDateRange:', startDate, 'vs', endDate, '=', isValid);
  console.log('Dates converties:', start, 'vs', end);
  
  return isValid;
};

/**
 * Valide que l'heure de début est antérieure à l'heure de fin (même jour)
 * @param {string} startTime - Heure de début (format HH:MM)
 * @param {string} endTime - Heure de fin (format HH:MM)
 * @param {string} startDate - Date de début (format YYYY-MM-DD)
 * @param {string} endDate - Date de fin (format YYYY-MM-DD)
 * @returns {boolean} - true si valide, false sinon
 */
export const validateTimeRange = (startTime, endTime, startDate, endDate) => {
  if (!startTime || !endTime) {
    console.log('validateTimeRange: heures manquantes');
    return false; // Les heures sont obligatoires
  }
  if (!startDate || !endDate) {
    console.log('validateTimeRange: dates manquantes');
    return false;
  }
  
  // Si les dates sont différentes, les heures n'ont pas besoin d'être validées
  if (startDate !== endDate) {
    console.log('validateTimeRange: dates différentes, validation ignorée');
    return true;
  }
  
  // Normaliser les heures si nécessaire
  const normalizedStartTime = startTime.length === 4 ? '0' + startTime : startTime;
  const normalizedEndTime = endTime.length === 4 ? '0' + endTime : endTime;
  
  const start = new Date(`${startDate}T${normalizedStartTime}`);
  const end = new Date(`${endDate}T${normalizedEndTime}`);
  
  const isValid = start < end;
  console.log('validateTimeRange:', normalizedStartTime, 'vs', normalizedEndTime, '=', isValid);
  console.log('Heures converties:', start, 'vs', end);
  
  return isValid;
};

/**
 * Valide les dates et heures pour un événement
 * @param {Object} formData - Données du formulaire
 * @param {Object} forumDates - Dates du forum { start_date, end_date }
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateEventDates = (formData, forumDates = null) => {
  const errors = [];
  
  console.log('Validation des dates - Données reçues:', formData);
  console.log('Dates du forum:', forumDates);
  
  // Validation des champs obligatoires
  if (!formData.start_date) {
    errors.push("La date de début est obligatoire");
  }
  if (!formData.end_date) {
    errors.push("La date de fin est obligatoire");
  }
  if (!formData.start_time) {
    errors.push("L'heure de début est obligatoire");
  }
  if (!formData.end_time) {
    errors.push("L'heure de fin est obligatoire");
  }
  
  // Validation des dates seulement si les deux dates sont présentes
  if (formData.start_date && formData.end_date) {
    console.log('Validation des dates:', formData.start_date, 'vs', formData.end_date);
    
    // Vérifier le format des dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.start_date) || !dateRegex.test(formData.end_date)) {
      errors.push("Format de date invalide (utilisez YYYY-MM-DD)");
    } else {
      if (!validateDateRange(formData.start_date, formData.end_date)) {
        errors.push("La date de début doit être antérieure ou égale à la date de fin");
      }
      
      // Validation par rapport aux dates du forum
      if (forumDates && forumDates.start_date && forumDates.end_date) {
        const eventStart = new Date(formData.start_date);
        const eventEnd = new Date(formData.end_date);
        const forumStart = new Date(forumDates.start_date);
        const forumEnd = new Date(forumDates.end_date);
        
        if (eventStart < forumStart) {
          errors.push(`La date de début doit être dans la plage du forum (${forumDates.start_date} - ${forumDates.end_date})`);
        }
        if (eventEnd > forumEnd) {
          errors.push(`La date de fin doit être dans la plage du forum (${forumDates.start_date} - ${forumDates.end_date})`);
        }
      }
    }
  }
  
  // Validation des heures seulement si toutes les données sont présentes
  if (formData.start_date && formData.end_date && formData.start_time && formData.end_time) {
    console.log('=== DEBUG VALIDATION HEURES ===');
    console.log('start_time brut:', JSON.stringify(formData.start_time));
    console.log('end_time brut:', JSON.stringify(formData.end_time));
    console.log('start_time type:', typeof formData.start_time);
    console.log('end_time type:', typeof formData.end_time);
    
    // Vérifier que les heures ne sont pas vides ou juste des espaces
    const startTimeTrimmed = formData.start_time.trim();
    const endTimeTrimmed = formData.end_time.trim();
    
    console.log('start_time trimmed:', JSON.stringify(startTimeTrimmed));
    console.log('end_time trimmed:', JSON.stringify(endTimeTrimmed));
    
    if (!startTimeTrimmed || !endTimeTrimmed) {
      console.log('Heures vides détectées');
      errors.push("Les heures de début et de fin sont obligatoires");
    } else {
      // Vérifier le format des heures - plus flexible
      // Accepter différents formats : HH:MM, H:MM, HH:MM:SS, H:MM:SS
      const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
      const startTimeValid = timeRegex.test(startTimeTrimmed);
      const endTimeValid = timeRegex.test(endTimeTrimmed);
      
      console.log('start_time valid:', startTimeValid);
      console.log('end_time valid:', endTimeValid);
      
      if (!startTimeValid || !endTimeValid) {
        console.log('Format invalide détecté');
        errors.push("Format d'heure invalide (utilisez HH:MM)");
      } else {
        // Normaliser les heures pour la validation
        // Supprimer les secondes si présentes et ajouter un 0 si nécessaire
        let normalizedStartTime = startTimeTrimmed;
        let normalizedEndTime = endTimeTrimmed;
        
        // Supprimer les secondes si présentes (HH:MM:SS -> HH:MM)
        if (normalizedStartTime.length === 8) {
          normalizedStartTime = normalizedStartTime.substring(0, 5);
        }
        if (normalizedEndTime.length === 8) {
          normalizedEndTime = normalizedEndTime.substring(0, 5);
        }
        
        // Ajouter un 0 si nécessaire (H:MM -> HH:MM)
        if (normalizedStartTime.length === 4) {
          normalizedStartTime = '0' + normalizedStartTime;
        }
        if (normalizedEndTime.length === 4) {
          normalizedEndTime = '0' + normalizedEndTime;
        }
        
        console.log('Heures normalisées:', normalizedStartTime, 'vs', normalizedEndTime);
        
        if (!validateTimeRange(normalizedStartTime, normalizedEndTime, formData.start_date, formData.end_date)) {
          errors.push("L'heure de début doit être antérieure à l'heure de fin");
        }
      }
    }
    console.log('=== FIN DEBUG ===');
  }
  
  console.log('Erreurs de validation:', errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les dates pour l'éducation/expérience (mois/année)
 * @param {Object} education - Données d'éducation
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateEducationDates = (education) => {
  const errors = [];
  
  console.log('Validation éducation/expérience:', education);
  
  // Validation des champs obligatoires
  if (!education.start_month) {
    errors.push("Le mois de début est obligatoire");
  }
  if (!education.start_year) {
    errors.push("L'année de début est obligatoire");
  }
  if (!education.end_month) {
    errors.push("Le mois de fin est obligatoire");
  }
  if (!education.end_year) {
    errors.push("L'année de fin est obligatoire");
  }
  
  // Validation des dates seulement si tous les champs sont présents
  if (education.start_month && education.start_year && 
      education.end_month && education.end_year) {
    
    const startDate = new Date(parseInt(education.start_year), 
                              getMonthIndex(education.start_month));
    const endDate = new Date(parseInt(education.end_year), 
                            getMonthIndex(education.end_month));
    
    console.log('Dates éducation:', startDate, 'vs', endDate);
    
    if (startDate > endDate) {
      errors.push("La date de début doit être antérieure à la date de fin");
    }
  }
  
  console.log('Erreurs éducation:', errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtient l'index du mois (0-11)
 * @param {string} monthName - Nom du mois
 * @returns {number} - Index du mois
 */
const getMonthIndex = (monthName) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName);
};

/**
 * Génère un message d'erreur formaté pour l'affichage
 * @param {Array} errors - Liste des erreurs
 * @returns {string} - Message formaté
 */
export const formatDateErrors = (errors) => {
  if (errors.length === 0) return '';
  return errors.join('\n');
};

/**
 * Valide les dates virtuelles d'un forum pour qu'elles soient entre start_date et end_date
 * @param {Object} formData - Données du formulaire avec les dates virtuelles
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateVirtualForumDates = (formData) => {
  const errors = [];
  
  // Vérifier que start_date et end_date sont définies
  if (!formData.start_date || !formData.end_date) {
    return { isValid: true, errors: [] }; // Pas de validation si les dates de base ne sont pas définies
  }
  
  const forumStartDate = new Date(formData.start_date);
  const forumEndDate = new Date(formData.end_date);
  
  // Liste des champs de dates virtuelles à valider
  const virtualDateFields = [
    { name: 'preparation_start', label: 'Début de la phase de préparation' },
    { name: 'preparation_end', label: 'Fin de la phase de préparation' },
    { name: 'jobdating_start', label: 'Début de la phase jobdating/traitement' },
    { name: 'interview_start', label: 'Début de la phase des entretiens' },
    { name: 'interview_end', label: 'Fin de la phase des entretiens' }
  ];
  
  // Vérifier chaque date virtuelle
  virtualDateFields.forEach(field => {
    const fieldValue = formData[field.name];
    
    if (fieldValue) {
      // Convertir la date virtuelle (format datetime-local: YYYY-MM-DDTHH:MM)
      const virtualDate = new Date(fieldValue);
      
      // Extraire seulement la date (sans l'heure) pour la comparaison
      const virtualDateOnly = new Date(virtualDate.getFullYear(), virtualDate.getMonth(), virtualDate.getDate());
      const forumStartDateOnly = new Date(forumStartDate.getFullYear(), forumStartDate.getMonth(), forumStartDate.getDate());
      const forumEndDateOnly = new Date(forumEndDate.getFullYear(), forumEndDate.getMonth(), forumEndDate.getDate());
      
      if (virtualDateOnly < forumStartDateOnly) {
        errors.push(`${field.label} doit être après ou égale à la date de début du forum (${formData.start_date})`);
      } else if (virtualDateOnly > forumEndDateOnly) {
        errors.push(`${field.label} doit être avant ou égale à la date de fin du forum (${formData.end_date})`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 