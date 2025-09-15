import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiUser, FiMail } from "react-icons/fi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/candidate/Education.css';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from "jwt-decode";

const CompleteRecruiterSetup = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  const passwordValidations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    match: password === confirmPassword && confirmPassword !== ''
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Object.values(passwordValidations).every(Boolean)) {
      toast.error('Le mot de passe ne respecte pas les critères requis.');
      return;
    }

    if (!first_name.trim() || !last_name.trim()) {
      toast.error('Le prénom et le nom sont requis.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/users/auth/complete-recruiter-setup/${token}/`, {
        password: password,
        confirm_password: confirmPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim()
      });

      const msg = response.data.message || 'Compte activé avec succès !';
      toast.success(msg);

      console.log('Réponse API:', response.data); // Debug

      // Stocker les tokens d'authentification et mettre à jour le contexte
      if (response.data.refresh && response.data.access) {
        // Extraire l'email du token JWT si pas présent dans la réponse
        let email = response.data.email;
        if (!email) {
          try {
            const decoded = jwtDecode(response.data.access);
            email = decoded.email || '';
          } catch (e) {
            console.error('Erreur décodage token:', e);
            email = '';
          }
        }
        
        console.log('Tentative de login avec:', { email, name: response.data.name || '' }); // Debug
        login(
          { access: response.data.access, refresh: response.data.refresh },
          { email: email, name: response.data.name || '' }
        );
      }

             // Redirection vers la page d'accueil recruteur
       setTimeout(() => {
         console.log('Redirection vers /recruiter');
         navigate('/recruiter');
       }, 1000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Une erreur est survenue lors de l\'activation du compte.';
      toast.error(msg);
      
      // Si le token est invalide ou expiré
      if (err.response?.status === 400) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si le token est valide au chargement
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Lien d\'invitation invalide.');
    }
  }, [token]);

  if (!tokenValid) {
    return (
      <div className="section education-section">
        <h3 className="education-title">Lien d'invitation invalide</h3>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          Ce lien d'invitation est invalide ou a expiré. Veuillez contacter l'administrateur pour obtenir un nouveau lien.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          className="validate-button"
          style={{ marginTop: '20px' }}
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="section education-section">
      <h3 className="education-title">Finaliser votre inscription</h3>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Complétez votre profil et définissez votre mot de passe pour activer votre compte recruteur.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Prénom */}
        <div className="input-modern">
          <span className="input-icon"><FiUser /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${first_name ? 'filled' : ''}`}>Prénom</label>
            <input
              type="text"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
        </div>

        {/* Nom */}
        <div className="input-modern">
          <span className="input-icon"><FiUser /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${last_name ? 'filled' : ''}`}>Nom</label>
            <input
              type="text"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="input-modern">
          <span className="input-icon"><FiLock /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${password ? 'filled' : ''}`}>Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
        </div>

        {/* Confirmation du mot de passe */}
        <div className="input-modern">
          <span className="input-icon"><FiLock /></span>
          <div className="input-wrapper-modern">
            <label className={`floating-label ${confirmPassword ? 'filled' : ''}`}>Confirmer le mot de passe</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
          {loading ? 'Activation en cours...' : 'Activer mon compte'}
        </button>
      </form>
    </div>
  );
};

export default CompleteRecruiterSetup; 