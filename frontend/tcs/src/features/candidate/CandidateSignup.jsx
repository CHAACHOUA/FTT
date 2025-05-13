import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import '../styles/candidate/signup.css';
import logo from '../../assets/logo-digitalio.png';

const API = process.env.REACT_APP_API_BASE_URL;

export default function CandidateSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation dynamique du mot de passe
  const passwordValidations = {
    length: formData.password.length >= 12,
    uppercase: /[A-Z]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.confirmPassword !== ''
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!Object.values(passwordValidations).every(Boolean)) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const res = await axios.post(
        `${API}/api/users/auth/signup/candidate`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access, refresh, role, email } = res.data;
      login({ access, refresh }, { role, email });
      navigate('/profile');
    } catch (err) {
      console.error("Erreur d'inscription :", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
          <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Logo Digitalio" className="navbar-logo" />
        </Link>
      </div>
      <h2 className="auth-title">Créer un compte</h2>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">

        {/* Prénom */}
        <div className="auth-input">
          <FiUser className="icon" />
          <input
            type="text"
            name="first_name"
            placeholder="Prénom *"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nom */}
        <div className="auth-input">
          <FiUser className="icon" />
          <input
            type="text"
            name="last_name"
            placeholder="Nom *"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="auth-input">
          <FiMail className="icon" />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Mot de passe */}
        <div className="auth-input password-wrapper">
          <FiLock className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mot de passe *"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        {/* Confirmation du mot de passe */}
        <div className="auth-input password-wrapper">
          <FiLock className="icon" />
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <div
            className="toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        {/* Animation Validation */}
        <div className="password-rules">
          <p className={passwordValidations.length ? 'valid' : 'invalid'}>
            • Minimum 12 caractères
          </p>
          <p className={passwordValidations.uppercase ? 'valid' : 'invalid'}>
            • Au moins une lettre majuscule
          </p>
          <p className={passwordValidations.match ? 'valid' : 'invalid'}>
            • Les mots de passe correspondent
          </p>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <div className="auth-footer">
        Vous avez déjà un compte ? <a href="/login">Se connecter</a>
      </div>
    </div>
  );
}
