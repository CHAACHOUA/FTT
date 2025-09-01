import React from 'react';
import '../../pages/styles/forum/ForumInfos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faBuilding, faVideo, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/Logo-FTT.png';
import ProgrammeTimeline from './ProgrammeTimeline';

const ForumInfos = ({ forum, onRegister, showRegisterButton = false }) => {
  const recruiterCount = forum.companies.reduce(
    (sum, company) => sum + company.recruiters.length,
    0
  );
  console.log(forum)
  const LogoCompany = logo;
  const baseURL=process.env.REACT_APP_API_BASE_URL;
  return (
    <div className="forum-infos-container">
      {/* Partie gauche : description */}
      <div className="forum-infos-left">
        <h2 className="forum-infos-title">Bienvenue !</h2>
        <p className="forum-infos-description">{forum.description}</p>
        {forum.highlight && (
          <p className="forum-infos-highlight">{forum.highlight}</p>
        )}
        
        {/* Timeline des programmes intégrée directement sous la description */}
        <div className="forum-programmes-section">
          <ProgrammeTimeline programmes={forum.programmes} />
        </div>
      </div>

      {/* Partie droite : bloc événement */}
      <div className="forum-infos-right">
        <h3 className="forum-infos-right-title">Détails de l’évènement</h3>

        <div className="forum-detail-line">
          <FontAwesomeIcon icon={faCalendarDays} className="fa-icon" />
          <span>
            {forum.start_date && forum.end_date ? (
              forum.start_date === forum.end_date ? (
                `Le ${new Date(forum.start_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} de ${forum.start_time} à ${forum.end_time}`
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

        <div className="forum-detail-line">
          {forum.type?.toLowerCase() === 'virtuel' ? (
            <FontAwesomeIcon icon={faVideo} className="fa-icon" />
          ) : forum.type?.toLowerCase() === 'hybride' ? (
            <FontAwesomeIcon icon={faVideo} className="fa-icon" />
          ) : (
            <FontAwesomeIcon icon={faMapMarkerAlt} className="fa-icon" />
          )}
          <span><strong>Format :</strong> {forum.type?.charAt(0).toUpperCase() + forum.type?.slice(1)}</span>
        </div>

        <div className="forum-detail-line">
          <FontAwesomeIcon icon={faBuilding} className="fa-icon" />
          <span>{forum.companies.length} Entreprises</span>
        </div>

        <div className="forum-detail-line">
          <span>Plus de {recruiterCount} recruteurs n'attendent que toi !</span>
          <div className="forum-recruiters-logo-list">
            {forum.companies.slice(0, 5).map((company, idx) => (
            <img
  key={idx}
  src={company.logo ? (company.logo.startsWith('http') ? company.logo : `${baseURL}${company.logo}`) : LogoCompany}
  alt={company.name}
  className="forum-recruiter-logo"
  onError={(e) => { e.target.onerror = null; e.target.src = LogoCompany; }}
/>
            ))}
            {forum.companies.length > 5 && (
              <span className="forum-more-recruiters">
                +{forum.companies.length - 5}
              </span>
            )}
          </div>
        </div>

        {showRegisterButton && (
          <button className="forum-register-button" onClick={onRegister}>
            S'inscrire
          </button>
        )}
      </div>
    </div>
  );
};

export default ForumInfos;
