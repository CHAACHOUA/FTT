import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../../../../pages/styles/common/login.css'; 
import logo from '../../../../assets/logo-digitalio.png';
import { Button, Input, Card, Badge } from '../../../../components/common';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/users/auth/request-password-reset/`, { email });
      toast.success(response.data.success || "Lien envoyé. Vérifiez votre boîte mail.");
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Une erreur est survenue.';
      toast.error(msg);
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
