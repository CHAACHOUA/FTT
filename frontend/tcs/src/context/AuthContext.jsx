import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [name, setName] = useState(null);
  const [role, setRole] = useState(null);
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Mode 100% sécurisé : vérifier uniquement via l'API avec cookies HttpOnly
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/me/`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setName(response.data.name);
        setRole(response.data.role);
        setTimezone(response.data.timezone || 'Europe/Paris');
        setIsAuthenticated(true);
      }
    } catch (apiError) {
      // Si on reçoit une erreur 401, essayer de rafraîchir le token
      if (apiError.response?.status === 401) {
        try {
          await refreshAccessToken();
          // Retry la requête après le refresh
          const retryResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/auth/me/`, {
            withCredentials: true
          });
          
          if (retryResponse.status === 200) {
            setName(retryResponse.data.name);
            setRole(retryResponse.data.role);
            setTimezone(retryResponse.data.timezone || 'Europe/Paris');
            setIsAuthenticated(true);
            return; // Sortir de la fonction si le retry réussit
          }
        } catch (refreshError) {
          // Si le refresh échoue aussi, l'utilisateur n'est pas authentifié
          console.log("Token refresh failed:", refreshError);
        }
      }
      
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (userData) => {
    const userName = userData.name || "User";
    const userRole = userData.role || "candidate";
    const userTimezone = userData.timezone || "Europe/Paris";
    
    // Mode 100% sécurisé : ne pas stocker de tokens dans localStorage
    setName(userName);
    setRole(userRole);
    setTimezone(userTimezone);
    setIsAuthenticated(true);
    
  };

  const logout = async (onRedirect) => {
    // Nettoyer immédiatement le state pour éviter les appels API pendant la déconnexion
    setName(null);
    setRole(null);
    setTimezone('Europe/Paris');
    setIsAuthenticated(false);
    
    // Vider localStorage immédiatement
    localStorage.clear();

    try {
      // Appeler l'endpoint de déconnexion pour supprimer les cookies
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/auth/logout/user/`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }

    // Fermer tous les toasts de manière sécurisée
    try {
      const { toast } = await import('react-toastify');
      toast.dismiss();
    } catch (error) {
      console.warn('Erreur lors de la fermeture des toasts:', error);
    }

    if (onRedirect) onRedirect();
  };

  const refreshAccessToken = async () => {
    try {
      // Mode 100% sécurisé : utiliser notre endpoint personnalisé avec cookies HttpOnly
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/auth/refresh-token/`, {}, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("Refresh token failed:", error);
      return false;
    }
  };

  const updateName = (newName) => {
    console.log('🔄 updateName appelé avec:', newName);
    // Si c'est un objet, extraire le nom et le timezone
    if (typeof newName === 'object' && newName !== null) {
      if (newName.name) {
        console.log('🔄 Mise à jour du nom:', newName.name);
        setName(newName.name);
      }
      if (newName.timezone) {
        console.log('🔄 Mise à jour du timezone:', newName.timezone);
        setTimezone(newName.timezone);
      }
    } else {
      // Si c'est une chaîne, mettre à jour seulement le nom
      console.log('🔄 Mise à jour du nom (chaîne):', newName);
      setName(newName);
    }
  };

  useEffect(() => {
    // Configuration globale d'axios pour les cookies
    axios.defaults.withCredentials = true;
    
    // Intercepteur pour gérer automatiquement le rafraîchissement des tokens
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Mode 100% sécurisé : utiliser uniquement les cookies HttpOnly
        config.withCredentials = true;
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs 401 (token expiré)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Éviter la boucle infinie pour certains endpoints
        if (originalRequest.url?.includes('/logout/user/') || 
            originalRequest.url?.includes('/refresh-token/')) {
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshSuccess = await refreshAccessToken();
          if (refreshSuccess) {
            // Retry la requête originale
            return axios(originalRequest);
          } else {
            // Si le refresh échoue, nettoyer le state et vider localStorage
            setName(null);
            setRole(null);
            setIsAuthenticated(false);
            
            // Vider localStorage après échec du refresh
            localStorage.clear();
            
            // Fermer tous les toasts de manière sécurisée
            try {
              const { toast } = await import('react-toastify');
              toast.dismiss();
            } catch (error) {
              console.warn('Erreur lors de la fermeture des toasts:', error);
            }
            
            // Éviter la boucle infinie en ne redirigeant que si on n'est pas déjà sur login
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        name,
        role,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
