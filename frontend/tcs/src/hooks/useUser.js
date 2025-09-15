import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../utils/userUtils';

/**
 * Hook personnalisé pour gérer les informations utilisateur
 * @returns {Object} Informations utilisateur et méthodes
 */
export const useUser = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    if (!isAuthenticated) {
      setUserInfo(null);
      return;
    }

    // Éviter les appels répétés si déjà en cours de chargement
    if (loading) return;

    setLoading(true);
    try {
      const user = await getCurrentUser();
      setUserInfo(user);
    } catch (error) {
      console.error("Erreur lors de la récupération des infos utilisateur:", error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUserInfo();
    }
  }, [isAuthenticated, isAuthLoading]);

  return {
    user: userInfo,
    loading: loading || isAuthLoading,
    isAuthenticated,
    refreshUser: fetchUserInfo,
    // Méthodes utilitaires
    hasRole: (role) => userInfo?.role === role,
    isAdmin: () => userInfo?.role === 'admin',
    isOrganizer: () => userInfo?.role === 'organizer',
    isRecruiter: () => userInfo?.role === 'recruiter',
    isCandidate: () => userInfo?.role === 'candidate',
  };
};
