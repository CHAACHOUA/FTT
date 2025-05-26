import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi"; // Icones pour le mot de passe
import '../../pages/styles/common/login.css'; // Import du même style
import logo from '../../assets/logo-digitalio.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  // Validation du mot de passe
  const passwordValidations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== ''
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Vérification que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Validation du mot de passe
    if (!Object.values(passwordValidations).every(Boolean)) {
      setError('Le mot de passe ne respecte pas les critères requis.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/users/auth/reset-password/${token}/`, {
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setMessage(response.data.success);
      setTimeout(() => navigate('/login'), 3000);
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
      <h2 className="login-title">Nouveau mot de passe</h2>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Champ de mot de passe */}
        <div className="input-group">
          <FiLock className="icon" />
          <label>Nouveau mot de passe *</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        {/* Champ de confirmation du mot de passe */}
        <div className="input-group">
          <FiLock className="icon" />
          <label>Confirmer le mot de passe *</label>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div
            className="toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        {/* Règles de validation du mot de passe avec animation */}
        <div className="password-rules">
          <p className={passwordValidations.length ? 'valid' : 'invalid'}>
            • Minimum 8 caractères
          </p>
          <p className={passwordValidations.uppercase ? 'valid' : 'invalid'}>
            • Au moins une lettre majuscule
          </p>
          <p className={passwordValidations.match ? 'valid' : 'invalid'}>
            • Les mots de passe correspondent
          </p>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
