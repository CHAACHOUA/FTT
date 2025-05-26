import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = process.env.REACT_APP_API_BASE_URL;

const ValidateProfile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.get(`${API}/api/users/auth/activate-account/${token}/`);
        setStatus('success');
        const msg = response.data.message || 'Votre compte a bien été activé.';
        setMessage(msg);
        toast.success(msg);

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          navigate('/login', { state: { message: msg } });
        }, 3000);
      } catch (error) {
        setStatus('error');
        const msg =
          error.response?.data?.error || 'Échec de l’activation du compte.';
        setMessage(msg);
        toast.error(msg);
      }
    };

    activateAccount();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Activation du compte</h1>

      {status === 'loading' && <p>Activation en cours...</p>}

      {status === 'error' && (
        <p className="mb-4 text-red-600">{message}</p>
      )}

      {status === 'success' && (
        <p className="mb-4 text-green-600">{message}</p>
      )}
    </div>
  );
};

export default ValidateProfile;
