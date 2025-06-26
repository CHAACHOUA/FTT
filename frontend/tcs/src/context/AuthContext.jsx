import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || null);
  const [name, setName] = useState(localStorage.getItem("name") || null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = !!accessToken;

  const login = (tokens, userData) => {
    const userName = userData.name || "User";
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    localStorage.setItem("name", userName);

    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    setName(userName);
  };

  const logout = (onRedirect) => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("name");

    setAccessToken(null);
    setRefreshToken(null);
    setName(null);

    if (onRedirect) onRedirect();
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });
      const newAccess = response.data.access;
      localStorage.setItem("access", newAccess);
      setAccessToken(newAccess);
      return newAccess;
    } catch (error) {
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem("access");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    const syncFromStorage = async () => {
      try {
        setAccessToken(localStorage.getItem("access"));
        setRefreshToken(localStorage.getItem("refresh"));
        setName(localStorage.getItem("name"));
      } catch (e) {
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    syncFromStorage();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        name,
        isAuthenticated,
        login,
        logout,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
