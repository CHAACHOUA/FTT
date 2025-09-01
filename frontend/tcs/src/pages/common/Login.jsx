import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/common/login.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import logo from '../../assets/logo-digitalio.png';
import Loading from '../../pages/common/Loading'; // ✅ import
import { jwtDecode } from "jwt-decode";

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
  const [showResendButton, setShowResendButton] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendButton(false);

    try {
      const res = await axios.post(
        `${API}/api/users/auth/login/user/`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access, refresh, email, message, name } = res.data;
      login({ access, refresh }, { email, name });

      // Extraire le rôle du token JWT pour être cohérent avec le reste de l'app
      const decoded = jwtDecode(access);
      const role = decoded.role;

      if (role === 'candidate') {
        navigate('/forums');
      } else if (role === 'recruiter') {
        navigate('/recruiter/forums');
      } else if (role === 'organizer') {
        navigate('/organizer/forums');
      } else {
        navigate('/forums');
      }
    } catch (err) {
      const resData = err.response?.data || {};
      const statusCode = err.response?.status;
      const errorMessage =
        resData.message ||
        resData.error ||
        "Erreur lors de la connexion. Veuillez réessayer.";
      toast.error(errorMessage);

      if (resData.activation_resend_possible || statusCode === 403) {
        setShowResendButton(true);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    try {
      const res = await axios.post(`${API}/api/users/auth/resend-activation/`, {
        email: formData.email,
      });
      toast.success(res.data.message || "Lien d’activation envoyé.");
      setShowResendButton(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l’envoi du mail.";
      toast.error(msg);
    }
  };

  // ✅ Affichage de Loading pendant la connexion
  if (loading) return <Loading />;

  return (
    <div className="login-container">
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Logo Digitalio" className="navbar-logo" />
        </Link>
      </div>

      <h2 className="login-title">Se connecter</h2>

      {showResendButton && (
        <div className="resend-container">
          <button onClick={handleResendActivation} className="resend-activation-button">
            Renvoyer le mail d’activation
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="icon"><FiMail /></span>
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

        <div className="input-group">
          <span className="icon"><FiLock /></span>
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

        <button type="submit" className="login-button">
          Se connecter
        </button>
      </form>

      <div className="login-footer">
        <Link to="/signup-candidate">Pas de compte ? S'inscrire</Link>
        <Link to="/forgot-password">Mot de passe oublié ?</Link>
      </div>
    </div>
  );
}
