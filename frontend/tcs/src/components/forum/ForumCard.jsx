import React, { useState } from 'react';
import { Calendar, MapPin, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForumRegistrationPopup from './ForumRegistrationPopup';
import defaultImage from '../../assets/forum-base.webp';
import logo from '../../assets/Logo-FTT.png';
import '../../pages/styles/forum/ForumList.css';
import '../../pages/styles/forum/Popup.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForumCard = ({ forum, role, isRegistered, onRegistered }) => {
  const [open, setOpen] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  // Fonction pour construire l'URL du logo
  const getLogoURL = (logo) => {
    if (!logo) return logo; // Retourne le logo par défaut
    if (typeof logo === 'string') {
      return logo.startsWith('http') ? logo : `${API}${logo}`;
    }
    return logo;
  };

  // Fonction pour construire l'URL de la photo du forum
  const getForumPhotoURL = (photo) => {
    if (!photo) return defaultImage; // Retourne l'image par défaut
    if (typeof photo === 'string') {
      return photo.startsWith('http') ? photo : `${API}${photo}`;
    }
    return defaultImage;
  };

  // Fonction pour l'inscription directe du recruteur
  const handleRecruiterRegistration = async () => {
    try {
      const API = process.env.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem('access');

      const response = await axios.post(
        `${API}/api/forums/${forum.id}/register-recruiter/`,
        {}, // Pas besoin de données, on utilise le profil du recruteur connecté
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Inscription réussie ! Votre entreprise a été ajoutée au forum en attente d\'approbation.');
      onRegistered?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Erreur lors de l'inscription.");
    }
  };

  return (
    <>
      <div className="forum-card">
        <img
          src={getForumPhotoURL(forum.photo)}
          alt="Bannière"
          className="forum-image-banner"
        />

        <div className="forum-card-body">
          <div className="forum-organizer">
            <img
              src={getLogoURL(forum.organizer?.logo) || logo}
              alt="logo organisateur"
              className="organizer-logo-seekube"
            />
            <span className="organizer-text">
              Organisé par {forum.organizer?.name}
            </span>
          </div>

          <h2 className="forum-title">{forum.name}</h2>

          <div className="forum-meta">
            <div>
              <Calendar size={16} /> 
              {forum.start_date && forum.end_date ? (
                forum.start_date === forum.end_date ? (
                  `${forum.start_date} ${forum.start_time} - ${forum.end_time}`
                ) : (
                  `${forum.start_date} - ${forum.end_date}`
                )
              ) : (
                'Date à définir'
              )}
            </div>
            <div>
              {forum.type?.toLowerCase() === 'virtuel' ? (
                <Video size={16} />
              ) : (
                <MapPin size={16} />
              )}
              &nbsp;{forum.type}
            </div>
          </div>

          <p className="forum-description">
            {forum.description?.length > 300
              ? forum.description.slice(0, 300) + '…'
              : forum.description}
          </p>

          <div className="forum-actions-seekube">
            <Link to={`/forums/event`} state={{ forum }}>
              <button className="btn-seekube btn-outline">En savoir plus</button>
            </Link>
            {!isRegistered && (
              <button
                className="btn-seekube btn-filled"
                onClick={role === 'recruiter' ? handleRecruiterRegistration : () => setOpen(true)}
              >
                S'inscrire
              </button>
            )}
          </div>
        </div>
      </div>

     
      {role === 'candidate' && (
        <ForumRegistrationPopup
          isOpen={open}
          onClose={() => setOpen(false)}
          forumId={forum.id}
          onSubmit={() => {
            onRegistered?.();
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ForumCard;
