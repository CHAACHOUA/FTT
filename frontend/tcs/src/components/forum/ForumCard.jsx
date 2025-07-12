import React, { useState } from 'react';
import { Calendar, MapPin, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForumRegistrationPopup from './ForumRegistrationPopup';
import ForumRecruiterRegistrationPopup from './ForumRecruiterRegistrationPopup'; // import
import defaultImage from '../../assets/forum-base.webp';
import logo from '../../assets/Logo-FTT.png';
import '../../pages/styles/forum/ForumList.css';
import '../../pages/styles/forum/Popup.css';

const ForumCard = ({ forum, role, isRegistered, onRegistered }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="forum-card">
        <img
          src={defaultImage}
          alt="Bannière"
          className="forum-image-banner"
        />

        <div className="forum-card-body">
          <div className="forum-organizer">
            <img
              src={forum.organizer?.logo || logo}
              alt="logo organisateur"
              className="organizer-logo-seekube"
            />
            <span className="organizer-text">
              Organisé par {forum.organizer?.name}
            </span>
          </div>

          <h2 className="forum-title">{forum.name}</h2>

          <div className="forum-meta">
            <div><Calendar size={16} /> {forum.date}</div>
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
                onClick={() => setOpen(true)}
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

  {(role === 'recruiter' || role === 'organizer') && (
  <ForumRecruiterRegistrationPopup
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
