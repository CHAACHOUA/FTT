// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// Créer le contexte
const AuthContext = createContext();

// Fournisseur du contexte
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [name, setName] = useState(localStorage.getItem("name") || null);

  const isAuthenticated = !!accessToken;

  // Fonction pour login (après inscription ou connexion)
  const login = (tokens, userData) => {
    const name = userData.name || "Candidat";
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("name", name);

    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    setRole(userData.role);
    setName(userData.name);
   
  };

  // Fonction pour logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("name");


    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setName(null);
  };

  // Pour s'assurer que l'état reste synchronisé avec localStorage
  useEffect(() => {
    setAccessToken(localStorage.getItem("access"));
    setRefreshToken(localStorage.getItem("refresh"));
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        role,
        name,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser AuthContext facilement
export function useAuth() {
  return useContext(AuthContext);
}
