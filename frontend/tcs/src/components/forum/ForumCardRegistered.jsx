import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../../pages/styles/forum/ForumList.css';
import photo_forum from '../../assets/forum-base.webp';

const ForumCardRegistered = ({ forum, role }) => {
  const isOngoing = () => {
    const now = new Date();
    const forumDate = new Date(forum.start_date);
    return forumDate.setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0);
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
        src={photo_forum}
        alt={`Bannière de ${forum.name}`}
        className="forum-card-image"
      />

      <div className="forum-card-content">
        <div className="forum-card-left">
          <div className="forum-card-date">
            <Calendar size={16} className="forum-meta-icon" />
            <span className="forum-meta-text">{formatDateTime()}</span>

            {ongoing && (
              <span className="forum-badge">
                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '6px' }} />
                Inscrit
              </span>
            )}
          </div>

          <div className="forum-card-title">{forum.name}</div>
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
