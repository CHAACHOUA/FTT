import React, { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../../features/styles/forum/ForumCard.css';
import photo_forum from '../../assets/forum-base.webp';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ForumCard = ({ forum, isRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleRegister = async () => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API}/api/forums/${forum.id}/register/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessage("Inscription réussie !");
    } catch (err) {
      if (err.response && err.response.data.detail) {
        setMessage(err.response.data.detail);
      } else {
        setMessage("Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-card">
      <img src={photo_forum} alt={forum.name} className="forum-image" />
      <div className="forum-content">
        <div className="forum-organizer">
          {forum.organizer.logo && (
            <img src={forum.organizer.logo} alt={forum.organizer.name} className="organizer-logo" />
          )}
          <span className="organizer-name">Organisé par {forum.organizer.name}</span>
        </div>

        <h3 className="forum-title">{forum.name}</h3>

        <div className="forum-meta">
          <div className="forum-meta-item">
            <Calendar size={16} /> Du {new Date(forum.date).toLocaleDateString('fr-FR')}
          </div>
          <div className="forum-meta-item">
            <MapPin size={16} /> {forum.type === 'presentiel' ? 'Présentiel' : 'Virtuel'}
          </div>
        </div>

        <p className="forum-description">
          {forum.description.length > 150
            ? forum.description.substring(0, 150) + '...'
            : forum.description}
        </p>

        <div className="forum-actions">
          <Link to={`/forums/${forum.id}`} className="forum-button-link">
            <button className="en-savoir-plus">En savoir plus</button>
          </Link>

          {!isRegistered && (
            <button 
              className="s-inscrire"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          )}
        </div>

        {message && (
          <p className="forum-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForumCard;
