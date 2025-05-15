import React from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';  // <-- importer Link
import '../../features/styles/forum/ForumCard.css';
import photo_forum from '../../assets/forum-base.webp';
import organizer_logo from '../../assets/Logo-FTT.png';

const ForumCard = ({ forum }) => {
  return (
    <Link to={`/forums/${forum.id}`} className="forum-card-link" style={{ textDecoration: 'none' }}>
      <div className="forum-card">
        {/* Image forum */}
        <img 
          src={photo_forum} 
          alt={forum.name} 
          className="forum-image" 
        />

        <div className="forum-content">
          {/* Organisateur */}
          {forum.organizer && (
            <div className="forum-organizer">
              {organizer_logo ? (
                <img 
                  src={organizer_logo} 
                  alt={`${forum.organizer.name}`} 
                  className="organizer-logo" 
                />
              ) : (
                <div className="organizer-logo placeholder" />
              )}
              <span className="organizer-name">{forum.organizer.name}</span>
            </div>
          )}

          <h2 className="forum-title">{forum.name}</h2>
          
          <div className="forum-meta">
            <span><FaTag /> {forum.type}</span>
            <span><FaCalendarAlt /> {forum.date}</span>
          </div>
          <p className="forum-description">{forum.description}</p>

          <button className="forum-button">S'inscrire</button>
        </div>
      </div>
    </Link>
  );
};

ForumCard.propTypes = {
  forum: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    photo: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string.isRequired,
    organizer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      logo: PropTypes.string,
    }),
  }).isRequired,
};

export default ForumCard;
