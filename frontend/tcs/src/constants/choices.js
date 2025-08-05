import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Cache pour les choix récupérés depuis l'API
let choicesCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère les choix standardisés depuis l'API
 * @returns {Promise<Object>} Les choix de secteurs et contrats
 */
export const fetchChoices = async () => {
  // Vérifier le cache
  if (choicesCache && cacheExpiry && Date.now() < cacheExpiry) {
    return choicesCache;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/choices/`);
    choicesCache = response.data;
    cacheExpiry = Date.now() + CACHE_DURATION;
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des choix:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      sectors: [
        { value: 'IT', label: 'Informatique' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'RH', label: 'Ressources Humaines' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Autre', label: 'Autre' },
      ],
      contracts: [
        { value: 'CDI', label: 'CDI' },
        { value: 'CDD', label: 'CDD' },
        { value: 'Stage', label: 'Stage' },
        { value: 'Alternance', label: 'Alternance' },
      ],
      forum_types: [
        { value: 'presentiel', label: 'Présentiel' },
        { value: 'virtuel', label: 'Virtuel' },
        { value: 'hybride', label: 'Hybride' },
      ],
    };
  }
};

/**
 * Récupère uniquement les secteurs
 * @returns {Promise<Array>} Liste des secteurs
 */
export const getSectors = async () => {
  const choices = await fetchChoices();
  return choices.sectors;
};

/**
 * Récupère uniquement les contrats
 * @returns {Promise<Array>} Liste des contrats
 */
export const getContracts = async () => {
  const choices = await fetchChoices();
  return choices.contracts;
};

/**
 * Récupère uniquement les types de forum
 * @returns {Promise<Array>} Liste des types de forum
 */
export const getForumTypes = async () => {
  const choices = await fetchChoices();
  return choices.forum_types;
};

/**
 * Convertit une liste de choix en format pour react-select
 * @param {Array} choices - Liste des choix
 * @returns {Array} Format pour react-select
 */
export const formatForReactSelect = (choices) => {
  return choices.map(choice => ({
    value: choice.value || choice[0],
    label: choice.label || choice[1],
  }));
};

/**
 * Récupère les secteurs formatés pour react-select
 * @returns {Promise<Array>} Secteurs formatés
 */
export const getSectorsForSelect = async () => {
  const sectors = await getSectors();
  return formatForReactSelect(sectors);
};

/**
 * Récupère les contrats formatés pour react-select
 * @returns {Promise<Array>} Contrats formatés
 */
export const getContractsForSelect = async () => {
  const contracts = await getContracts();
  return formatForReactSelect(contracts);
};

/**
 * Récupère les types de forum formatés pour react-select
 * @returns {Promise<Array>} Types de forum formatés
 */
export const getForumTypesForSelect = async () => {
  const forumTypes = await getForumTypes();
  return formatForReactSelect(forumTypes);
}; 