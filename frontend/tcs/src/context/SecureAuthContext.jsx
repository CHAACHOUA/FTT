import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const SecureAuthContext = createContext();

export function SecureAuthProvider({ children }) {
  const [name, setName] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configuration globale d'axios pour les cookies
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Vérifier l'authentification via l'API (cookies HttpOnly)
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/auth/me/`);
      
      if (response.status === 200) {
        setIsAuthenticated(true);
        setName(response.data.name);
        setRole(response.data.role);
        console.log("✅ Utilisateur authentifié via cookies HttpOnly");
      }
    } catch (error) {
      console.log("❌ Authentification échouée:", error);
      setIsAuthenticated(false);
      setName(null);
      setRole(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/auth/login/user/`,
        credentials,
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        // Les cookies HttpOnly sont automatiquement définis par le backend
        setName(response.data.name);
        setRole(response.data.role);
        setIsAuthenticated(true);
        console.log("✅ Connexion sécurisée réussie");
        return { success: true };
      }
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/auth/logout/user/`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le state
      setIsAuthenticated(false);
      setName(null);
      setRole(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/token/refresh/`,
        {},
        { withCredentials: true }
      );
      return response.status === 200;
    } catch (error) {
      console.error("Token de rafraîchissement expiré:", error);
      await logout();
      throw error;
    }
  };

  // Intercepteur pour gérer automatiquement le rafraîchissement
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshAccessToken();
            return axios(originalRequest);
          } catch (refreshError) {
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(responseInterceptor);
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <SecureAuthContext.Provider
      value={{
        name,
        role,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
        refreshAccessToken,
        checkAuthStatus,
      }}
    >
      {children}
    </SecureAuthContext.Provider>
  );
}

export function useSecureAuth() {
  return useContext(SecureAuthContext);
}
