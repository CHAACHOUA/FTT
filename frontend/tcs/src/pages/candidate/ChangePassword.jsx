import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import '../../pages/styles/candidate/Education.css'; // on garde le même fichier CSS


const ChangePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const passwordValidations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== ''
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!Object.values(passwordValidations).every(Boolean)) {
      setError('Le mot de passe ne respecte pas les critères requis.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await axios.post(`${API}/api/users/auth/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(response.data.message || 'Mot de passe changé avec succès.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section education-section">
      <h3 className="education-title">Changer le mot de passe</h3>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Ancien mot de passe */}
        <div className="input-modern">
          <span className="input-icon"><FiLock /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${oldPassword ? 'filled' : ''}`}>Ancien mot de passe</label>
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="off"
              required
            />
            <div className="toggle-password" onClick={() => setShowOld(!showOld)}>
              {showOld ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div className="input-modern">
          <span className="input-icon"><FiLock /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${newPassword ? 'filled' : ''}`}>Nouveau mot de passe</label>
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="off"
              required
            />
            <div className="toggle-password" onClick={() => setShowNew(!showNew)}>
              {showNew ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="input-modern">
          <span className="input-icon"><FiLock /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${confirmPassword ? 'filled' : ''}`}>Confirmer le mot de passe</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
              required
            />
            <div className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
        </div>

        {/* Règles de sécurité */}
        <div className="password-rules">
          <p className={passwordValidations.length ? 'valid' : 'invalid'}>• Minimum 8 caractères</p>
          <p className={passwordValidations.uppercase ? 'valid' : 'invalid'}>• Une majuscule</p>
          <p className={passwordValidations.match ? 'valid' : 'invalid'}>• Les deux mots de passe sont identiques</p>
        </div>

        <button type="submit" className="validate-button" disabled={loading}>
          {loading ? 'Chargement...' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
