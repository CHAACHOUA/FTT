// src/features/candidate/common/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/common/login.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import logo from '../../assets/logo-digitalio.png';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API}/api/users/auth/login/candidate`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access, refresh, role, email } = res.data;
      login({ access, refresh }, { role, email });

      if (role === 'candidate') {
        navigate('/');
      } else if (role === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || "Erreur lors de la connexion. Veuillez réessayer.";
      setError(errorMessage);
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
      <h2 className="login-title">Se connecter</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="input-group">
          <span className="icon">
            <FiMail />
          </span>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Mot de passe */}
        <div className="input-group">
          <span className="icon">
            <FiLock />
          </span>
          <label>Mot de passe *</label>
          <div className="password-wrapper" style={{ width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="login-footer">
        <a href="/signup-candidate">Pas de compte ? S'inscrire</a>
        <a href="/forgot-password">Mot de passe oublié ?</a>
      </div>
    </div>
  );
}
