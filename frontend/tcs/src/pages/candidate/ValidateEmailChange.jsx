import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_BASE_URL;

const ValidateEmailChange = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasCalled = useRef(false); // empêche double appel

  useEffect(() => {
    const validateEmail = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        const response = await axios.get(
          `${API}/api/users/auth/validate-email-change/${token}/`
        );

        const msg = response.data.message || 'Votre adresse email a bien été mise à jour.';
        toast.success(msg);

        // Email mis à jour avec succès

        setTimeout(() => {
          navigate('/candidate/profile');
        }, 400);
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Le lien est invalide ou a expiré.';
        toast.error(msg);

        setTimeout(() => {
          navigate('/candidate/profile');
        }, 400);
      }
    };

    if (token) {
      validateEmail();
    } else {
      toast.error("Token de validation manquant.");
    }
  }, [token, navigate]);

  return null;
};

export default ValidateEmailChange;
