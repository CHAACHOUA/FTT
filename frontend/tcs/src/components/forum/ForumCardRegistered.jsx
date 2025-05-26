import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../pages/styles/forum/ForumCardRegistered.css';
import photo_forum from '../../assets/forum-base.webp'

const ForumCardRegistered = ({ forum }) => {
  return (
    <div className="forum-card-registered">
      <img src={photo_forum} alt={forum.name} className="forum-card-image" />
      <div className="forum-card-content">
        <div className="forum-card-header">
          <div className="forum-card-date">
            <Calendar size={18} />
            <span>{new Date(forum.date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}</span>
          </div>
          <div className="forum-card-status">
            <span className="forum-status-tag">Inscrit</span>
          </div>
        </div>

        <h3 className="forum-card-title">{forum.name}</h3>
        <p className="forum-card-description">
          {forum.description.length > 100
            ? forum.description.substring(0, 100) + '...'
            : forum.description}
        </p>

        <div className="forum-card-footer">
          <Link to={`/forums/${forum.id}`} className="forum-card-link">
            Accéder à l'événement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForumCardRegistered;
