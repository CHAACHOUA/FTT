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
  // Debug: Log forum data
  console.log('🔍 [FRONTEND] ForumCard - forum:', forum);
  console.log('🔍 [FRONTEND] ForumCard - forum.id:', forum?.id);
  
  const [open, setOpen] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  // Fonction pour construire l'URL du logo
  const getLogoURL = (logo) => {
    if (!logo) return logo; // Retourne le logo par défaut
    if (typeof logo === 'string') {
      if (logo.startsWith('http')) return logo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      return `${mediaBaseUrl}${logo}`;
    }
    return logo;
  };

  // Fonction pour construire l'URL de la photo du forum
  const getForumPhotoURL = (photo) => {
    console.log('🔍 [FRONTEND] ForumCard - getForumPhotoURL - photo:', photo);
    if (!photo) {
      console.log('🔍 [FRONTEND] ForumCard - getForumPhotoURL - pas de photo, retour image par défaut');
      return defaultImage; // Retourne l'image par défaut
    }
    if (typeof photo === 'string') {
      if (photo.startsWith('http')) {
        console.log('🔍 [FRONTEND] ForumCard - getForumPhotoURL - URL complète:', photo);
        return photo;
      }
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const fullUrl = `${mediaBaseUrl}${photo}`;
      console.log('🔍 [FRONTEND] ForumCard - getForumPhotoURL - URL construite:', fullUrl);
      return fullUrl;
    }
    console.log('🔍 [FRONTEND] ForumCard - getForumPhotoURL - type non string, retour image par défaut');
    return defaultImage;
  };

  // Fonction pour l'inscription directe du recruteur
  const handleRecruiterRegistration = async () => {
    try {
      const API = process.env.REACT_APP_API_BASE_URL;

      const response = await axios.post(
        `${API}/forums/${forum.id}/register-recruiter/`,
        {}, // Pas besoin de données, on utilise le profil du recruteur connecté
        {
          withCredentials: true,
          headers: {
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
          onError={(e) => {
            console.log('🔍 [FRONTEND] ForumCard - Erreur chargement image, utilisation image par défaut');
            e.target.src = defaultImage;
          }}
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
            <div className="forum-meta-item">
              <Calendar size={16} className="forum-meta-icon" />
              <span className="forum-meta-text">
                {forum.start_date && forum.end_date ? (
                  forum.start_date === forum.end_date ? (
                    `${new Date(forum.start_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} • ${forum.start_time} - ${forum.end_time}`
                  ) : (
                    `Du ${new Date(forum.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} au ${new Date(forum.end_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}`
                  )
                ) : (
                  'Date à définir'
                )}
              </span>
            </div>
            <div className="forum-meta-item">
              {forum.type?.toLowerCase() === 'virtuel' ? (
                <Video size={16} className="forum-meta-icon" />
              ) : forum.type?.toLowerCase() === 'hybride' ? (
                <Video size={16} className="forum-meta-icon" />
              ) : (
                <MapPin size={16} className="forum-meta-icon" />
              )}
              <span className="forum-meta-text">
                <strong>Format :</strong> {forum.type?.charAt(0).toUpperCase() + forum.type?.slice(1)}
              </span>
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
