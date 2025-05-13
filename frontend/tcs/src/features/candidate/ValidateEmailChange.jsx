import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
        setMessage(response.data.message || 'Your email has been successfully updated.');
        setIsSuccess(true);

        // Mettre à jour l'email dans le localStorage
        if (response.data.new_email) {
          localStorage.setItem('email', response.data.new_email); // Assure-toi que le backend renvoie l'email mis à jour
        }

        // Rediriger l'utilisateur vers son profil après le succès
        navigate('/profile');
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.error || 'The validation link is invalid or expired.');
        } else {
          setMessage('An unexpected error occurred.');
        }
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    validateEmail();
  }, [token]); // 🔁 C'est bien `token`, pas `token_str`

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Validating your email address...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
        {isSuccess ? 'Success' : 'Error'}
      </h1>
      <p>{message}</p>
    </div>
  );
};

export default ValidateEmailChange;
