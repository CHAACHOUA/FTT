import axios from 'axios';

/**
 * Récupère les informations de l'utilisateur connecté
 * @returns {Promise<Object|null>} Informations utilisateur ou null si non connecté
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/me/`, {
      withCredentials: true
    });
    
    if (response.status === 200) {
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isActive: response.data.is_active
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param {string} requiredRole - Rôle requis
 * @returns {Promise<boolean>} True si l'utilisateur a le rôle
 */
export const hasRole = async (requiredRole) => {
  const user = await getCurrentUser();
  return user && user.role === requiredRole;
};

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {Promise<boolean>} True si authentifié
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return user !== null;
};

/**
 * Récupère le nom d'affichage de l'utilisateur
 * @returns {Promise<string>} Nom d'affichage ou "Utilisateur"
 */
export const getUserDisplayName = async () => {
  const user = await getCurrentUser();
  return user ? user.name : "Utilisateur";
};
