import { useCallback } from 'react';
import toast from '../utils/toast';

/**
 * Hook personnalisé pour gérer les toasts de manière sécurisée
 */
export const useToast = () => {
  const showSuccess = useCallback((message, options = {}) => {
    return toast.success(message, options);
  }, []);

  const showError = useCallback((message, options = {}) => {
    return toast.error(message, options);
  }, []);

  const showInfo = useCallback((message, options = {}) => {
    return toast.info(message, options);
  }, []);

  const showWarning = useCallback((message, options = {}) => {
    return toast.warning(message, options);
  }, []);

  const dismiss = useCallback((toastId = null) => {
    return toast.dismiss(toastId);
  }, []);

  const update = useCallback((toastId, options) => {
    return toast.update(toastId, options);
  }, []);

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    dismiss,
    update
  };
};

export default useToast;
