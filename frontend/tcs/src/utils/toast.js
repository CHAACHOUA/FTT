import { toast as reactToastify } from 'react-toastify';

// Wrapper sécurisé pour éviter les erreurs de toast
const safeToast = {
  success: (message, options = {}) => {
    try {
      return reactToastify.success(message, {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
      });
    } catch (error) {
      console.warn('Erreur lors de l\'affichage du toast success:', error);
    }
  },

  error: (message, options = {}) => {
    try {
      return reactToastify.error(message, {
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
      });
    } catch (error) {
      console.warn('Erreur lors de l\'affichage du toast error:', error);
    }
  },

  info: (message, options = {}) => {
    try {
      return reactToastify.info(message, {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
      });
    } catch (error) {
      console.warn('Erreur lors de l\'affichage du toast info:', error);
    }
  },

  warning: (message, options = {}) => {
    try {
      return reactToastify.warning(message, {
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
      });
    } catch (error) {
      console.warn('Erreur lors de l\'affichage du toast warning:', error);
    }
  },

  // Méthode pour fermer tous les toasts de manière sécurisée
  dismiss: (toastId = null) => {
    try {
      if (toastId) {
        reactToastify.dismiss(toastId);
      } else {
        reactToastify.dismiss();
      }
    } catch (error) {
      console.warn('Erreur lors de la fermeture du toast:', error);
    }
  },

  // Méthode pour mettre à jour un toast de manière sécurisée
  update: (toastId, options) => {
    try {
      return reactToastify.update(toastId, options);
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du toast:', error);
    }
  }
};

export default safeToast;
