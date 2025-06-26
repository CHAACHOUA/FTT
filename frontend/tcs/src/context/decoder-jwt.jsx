import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("access");

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded; 
  } catch (error) {
    console.error("Token invalide :", error);
    return null;
  }
};
