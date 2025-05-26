// src/pages/auth/RequestPasswordReset.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import '../../pages/styles/common/login.css'; 
import logo from '../../assets/logo-digitalio.png';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/api/users/auth/request-password-reset/`, { email });
      setMessage(response.data.success);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
       <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Logo Digitalio" className="navbar-logo" />
        </Link>
      </div>
      <h2 className="login-title">Réinitialisation du mot de passe</h2>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="icon">&#9993;</span>
          <label>Email *</label>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
    </div>
  );
};

export default RequestPasswordReset;
