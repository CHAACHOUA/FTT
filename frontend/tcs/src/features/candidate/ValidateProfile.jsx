import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        setMessage(response.data.message);

        // Rediriger vers la page de connexion avec un message de succès
        navigate('/login', { state: { message: 'Your account has been successfully activated.' } });
      } catch (error) {
        setStatus('error');
        if (error.response) {
          setMessage(error.response.data.error || 'Activation failed.');
        } else {
          setMessage('An unexpected error occurred.');
        }
      }
    };

    activateAccount();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Account Activation</h1>

      {status === 'loading' && <p>Activating your account...</p>}

      {status !== 'loading' && status === 'error' && (
        <p className="mb-4 text-red-600">{message}</p>
      )}
    </div>
  );
};

export default ValidateProfile;
