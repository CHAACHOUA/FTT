import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faUser,
  faEye,
  faEnvelope,
  faPhone,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import './PersonCard.css';

const PersonCard = ({
  person,
  onEdit,
  onDelete,
  onView,
  onContact,
  onSend,
  showActions = true,
  showContact = false,
  showView = false,
  showSend = false,
  type = 'speaker', // 'speaker', 'recruiter', 'member'
  className = ''
}) => {
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const getImageUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith('http') 
      ? photo 
      : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${photo}`;
  };

  const getPersonName = () => {
    if (person.full_name) return person.full_name;
    if (person.first_name && person.last_name) {
      return `${person.first_name} ${person.last_name}`;
    }
    return 'Nom non disponible';
  };

  const getPersonRole = () => {
    if (type === 'speaker') return person.position;
    if (type === 'recruiter') return person.position || person.role;
    if (type === 'member') return person.position || person.department;
    return person.position;
  };

  const getPersonCompany = () => {
    if (person.company && person.company.name) return person.company.name;
    if (person.company_name) return person.company_name;
    return null;
  };

  return (
    <div className={`person-card ${type} ${className}`}>
      <div className="person-photo">
        {person.photo ? (
          <img 
            src={getImageUrl(person.photo)}
            alt={getPersonName()}
            onError={handleImageError}
          />
        ) : null}
        <div className="person-photo-placeholder" style={{ display: person.photo ? 'none' : 'flex' }}>
          <FontAwesomeIcon icon={faUser} />
        </div>
      </div>

      <div className="person-info">
        <h4 className="person-name">{getPersonName()}</h4>
        {getPersonRole() && (
          <p className="person-role">{getPersonRole()}</p>
        )}
        {getPersonCompany() && (
          <p className="person-company">{getPersonCompany()}</p>
        )}
        {person.email && (showContact || showSend) && (
          <div className="person-contact">
            <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
            <span>{person.email}</span>
          </div>
        )}
        {person.phone && showContact && (
          <div className="person-contact">
            <FontAwesomeIcon icon={faPhone} className="contact-icon" />
            <span>{person.phone}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="person-actions">
          {onView && showView && (
            <button 
              className="action-btn view-btn"
              onClick={() => onView(person)}
              title="Voir le profil"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          )}
          {onEdit && (
            <button 
              className="action-btn edit-btn"
              onClick={() => onEdit(person)}
              title="Modifier"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          )}
          {onDelete && (
            <button 
              className="action-btn delete-btn"
              onClick={() => onDelete(person.id || person.id)}
              title="Supprimer"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
          {onContact && showContact && (
            <button 
              className="action-btn contact-btn"
              onClick={() => onContact(person)}
              title="Contacter"
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </button>
          )}
          {onSend && showSend && (
            <button 
              className="action-btn send-btn"
              onClick={() => onSend(person)}
              title="Envoyer un message"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonCard;
