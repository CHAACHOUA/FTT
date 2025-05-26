import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../pages/styles/common/login.css';
import logo from '../../assets/logo-digitalio.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const passwordValidations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== ''
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Object.values(passwordValidations).every(Boolean)) {
      toast.error('Le mot de passe ne respecte pas les critères requis.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/users/auth/reset-password/${token}/`, {
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      const msg = response.data.success || 'Mot de passe réinitialisé avec succès.';
      toast.success(msg);

      setTimeout(() => navigate('/login'), 3000);
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
      <h2 className="login-title">Nouveau mot de passe</h2>

      <form onSubmit={handleSubmit}>
        {/* Nouveau mot de passe */}
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

        {/* Confirmation */}
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

        {/* Règles */}
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
