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
  
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  
  const isValid = start < end;
  console.log('validateTimeRange:', startTime, 'vs', endTime, '=', isValid);
  console.log('Heures converties:', start, 'vs', end);
  
  return isValid;
};

/**
 * Valide les dates et heures pour un événement
 * @param {Object} formData - Données du formulaire
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateEventDates = (formData) => {
  const errors = [];
  
  console.log('Validation des dates - Données reçues:', formData);
  
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
    }
  }
  
  // Validation des heures seulement si toutes les données sont présentes
  if (formData.start_date && formData.end_date && formData.start_time && formData.end_time) {
    console.log('Validation des heures:', formData.start_time, 'vs', formData.end_time);
    
    // Vérifier le format des heures
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(formData.start_time) || !timeRegex.test(formData.end_time)) {
      errors.push("Format d'heure invalide (utilisez HH:MM)");
    } else {
      if (!validateTimeRange(formData.start_time, formData.end_time, formData.start_date, formData.end_date)) {
        errors.push("L'heure de début doit être antérieure à l'heure de fin");
      }
    }
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