import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ValidateEmailChange = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const validateEmail = async () => {
      try {
        const response = await axios.get(
          `${API}/api/users/auth/validate-email-change/${token}/`
        );

        const msg = response.data.message || 'Your email has been successfully updated.';
        setMessage(msg);
        setIsSuccess(true);
        toast.success(msg);

        if (response.data.new_email) {
          localStorage.setItem('email', response.data.new_email);
        }

        // Rediriger l'utilisateur après un petit délai
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (error) {
        const msg =
          error.response?.data?.error || 'The validation link is invalid or expired.';
        setMessage(msg);
        setIsSuccess(false);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    validateEmail();
  }, [token]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Validation de votre adresse email en cours...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
        {isSuccess ? 'Succès' : 'Erreur'}
      </h1>
      <p>{message}</p>
    </div>
  );
};

export default ValidateEmailChange;
