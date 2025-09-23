import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_BASE_URL;

const ValidateProfile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasCalled = useRef(false); // ✅ garde mémoire du premier appel

  useEffect(() => {
    const activateAccount = async () => {
      if (hasCalled.current) return; // ❌ bloque les appels suivants
      hasCalled.current = true;

      try {
        const response = await axios.get(`${API}/users/auth/activate-account/${token}/`);
        const msg = response.data.message || 'Votre compte a bien été activé.';
        toast.success(msg);

        // Redirection après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 400);
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Échec de l’activation du compte.";
        toast.error(msg);
            setTimeout(() => {
          navigate('/login');
        }, 400);
      }
    };

    if (token) {
      activateAccount();
    } else {
      toast.error("Token d'activation manquant.");
    }
  }, [token, navigate]);

  return null; // ✅ aucun affichage à l'écran, tout passe par les toasts
};

export default ValidateProfile;
