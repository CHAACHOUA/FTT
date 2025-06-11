import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../pages/styles/forum/ForumList.css';
import photo_forum from '../../assets/forum-base.webp';

const ForumCardRegistered = ({ forum, onRefresh }) => {
  const formatDateRange = (start, end) => {
    if (!start || !end) return "Dates à venir";
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2)) return "Dates à venir";
    return `${d1.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${d2.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
  };

  return (
    <div className="forum-card-registered">
      <img
        src={forum.image || photo_forum}
        alt={forum.name}
        className="forum-card-image"
      />

      <div className="forum-card-content">
        <div className="forum-card-left">
          <div className="forum-card-date">
            <Calendar size={16} />
            <span>{formatDateRange(forum.date_debut, forum.date_fin)}</span>
          </div>
          <div className="forum-card-title">{forum.name}</div>
        </div>

       <Link to={`/event/dashboard/${forum.id}`} className="forum-card-link">
  Accéder à l'événement
</Link>

      </div>
    </div>
  );
};

export default ForumCardRegistered;
