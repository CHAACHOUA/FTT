import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faVideo, faMapMarkerAlt, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import Badge from '../../common/Badge';
import '../../../pages/styles/forum/ForumList.css';
import defaultImage from '../../../assets/forum-base.webp';
import axios from 'axios';

const ForumCardRegistered = ({ forum, role }) => {
  const [recruiterStatus, setRecruiterStatus] = useState(null);
  const API = process.env.REACT_APP_API_BASE_URL;

  // Vérifier le statut du recruteur au chargement
  useEffect(() => {
    if (role === 'recruiter') {
      checkRecruiterStatus();
    }
  }, [role, forum.id]);

  // Fonction pour vérifier le statut d'inscription du recruteur
  const checkRecruiterStatus = async () => {
    try {
      const response = await axios.get(
        `${API}/forums/${forum.id}/recruiter-status/`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setRecruiterStatus(response.data.status);
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
      setRecruiterStatus('approved'); // Par défaut, considérer comme approuvé
    }
  };

  // Fonction pour construire l'URL de la photo du forum
  const getForumPhotoURL = (photo) => {
    console.log('🔍 [FRONTEND] ForumCardRegistered - getForumPhotoURL - photo:', photo);
    if (!photo) {
      console.log('🔍 [FRONTEND] ForumCardRegistered - getForumPhotoURL - pas de photo, retour image par défaut');
      return defaultImage; // Retourne l'image par défaut
    }
    if (typeof photo === 'string') {
      if (photo.startsWith('http')) {
        console.log('🔍 [FRONTEND] ForumCardRegistered - getForumPhotoURL - URL complète:', photo);
        return photo;
      }
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const fullUrl = `${mediaBaseUrl}${photo}`;
      console.log('🔍 [FRONTEND] ForumCardRegistered - getForumPhotoURL - URL construite:', fullUrl);
      return fullUrl;
    }
    console.log('🔍 [FRONTEND] ForumCardRegistered - getForumPhotoURL - type non string, retour image par défaut');
    return defaultImage;
  };

  const isOngoing = () => {
    if (!forum.end_date) return false;
    
    // Normaliser le format de la date (enlever l'heure si présente)
    let dateStr = forum.end_date;
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Normaliser le format de l'heure (ajouter les secondes si manquantes)
    let timeStr = '23:59:59';
    if (forum.end_time) {
      const timeParts = forum.end_time.split(':');
      if (timeParts.length === 2) {
        // Format HH:MM -> ajouter :00 pour les secondes
        timeStr = `${timeParts[0]}:${timeParts[1]}:00`;
      } else if (timeParts.length === 3) {
        // Format HH:MM:SS -> utiliser tel quel
        timeStr = forum.end_time;
      }
    }
    
    const endDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    
    // Vérifier que la date est valide
    if (isNaN(endDateTime.getTime())) {
      return false;
    }
    
    return endDateTime >= now;
  };

  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = () => {
    if (forum.start_date && forum.end_date) {
      if (forum.start_date === forum.end_date) {
        return `${formatDate(forum.start_date)} ${forum.start_time} - ${forum.end_time}`;
      } else {
        return `${formatDate(forum.start_date)} - ${formatDate(forum.end_date)}`;
      }
    }
    return 'Date à définir';
  };

  const ongoing = isOngoing();

  // Type de forum avec icône
  const getTypeData = (type) => {
    const mapping = {
      virtuel: { icon: faVideo, label: 'Virtuel', cls: 'type-virtual' },
      hybride: { icon: faExchangeAlt, label: 'Hybride', cls: 'type-hybrid' },
      presentiel: { icon: faMapMarkerAlt, label: 'Présentiel', cls: 'type-physical' },
    };
    return mapping[type] || mapping.virtuel;
  };
  const typeData = getTypeData(forum?.type);

  // Déterminer le lien du dashboard en fonction du rôle
const dashboardPath =
  role === 'recruiter'
    ? '/event/recruiter/dashboard'
    : role === 'organizer'
    ? '/event/organizer/dashboard'
    : '/event/candidate/dashboard';


  return (
    <div className={`forum-card-registered ${!ongoing ? 'forum-ended' : ''}`}>
      <img
        src={getForumPhotoURL(forum.photo)}
        alt={`Bannière de ${forum.name}`}
        className="forum-card-image"
        onError={(e) => {
          console.log('🔍 [FRONTEND] ForumCardRegistered - Erreur chargement image, utilisation image par défaut');
          e.target.src = defaultImage;
        }}
      />

      <div className="forum-card-content">
        <div className="forum-card-left">
          <div className="forum-card-date">
            <Calendar size={16} className="forum-meta-icon" />
            <span className="forum-meta-text">{formatDateTime()}</span>

            {ongoing && (
              <>
                {role === 'recruiter' && recruiterStatus === 'pending' ? (
                  <Badge type="forum" variant="pending">En attente</Badge>
                ) : (
                  <Badge type="forum" variant="registered">Inscrit</Badge>
                )}
              </>
            )}
          </div>

          <div className="forum-card-title">{forum.name}</div>
          <div className={`forum-type-pill ${typeData.cls}`}>
            <FontAwesomeIcon icon={typeData.icon} className="forum-type-icon" />
            <span className="forum-type-label">{typeData.label}</span>
          </div>
        </div>

        {ongoing && (
          <Link
            to={dashboardPath}
            state={{ forum }}
            className="forum-card-link"
          >
            Accéder à l'événement
          </Link>
        )}
      </div>
    </div>
  );
};

export default ForumCardRegistered;
