import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../common';
import '../../pages/styles/forum/ForumInfos.css';
import '../../pages/organizer/Event/programmes/ProgrammeManager.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faBuilding, faVideo, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/Logo-FTT.png';
import EventCard from '../card/common/EventCard';
import Loading from '../loyout/Loading';

const ForumInfos = ({ forum, onRegister, showRegisterButton = false }) => {
  const [activeDay, setActiveDay] = useState(null);
  
  const recruiterCount = forum?.companies ? forum.companies.reduce(
    (sum, company) => sum + (company.recruiters ? company.recruiters.length : 0),
    0
  ) : 0;
  console.log(' [ForumInfos] Forum:', forum);
  console.log(' [ForumInfos] Forum ID:', forum?.id);
  console.log(' [ForumInfos] Programmes:', forum?.programmes);
  const LogoCompany = logo;
  const baseURL=process.env.REACT_APP_API_BASE_URL;

  // Fonction pour grouper les programmes par jour
  const groupProgrammesByDay = (programmes) => {
    const grouped = {};
    
    programmes.forEach(programme => {
      const dateKey = programme.start_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(programme);
    });

    // Trier les programmes par heure de début dans chaque jour
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
    });

    return grouped;
  };

  // Fonction pour obtenir les jours triés
  const getSortedDays = (groupedProgrammes) => {
    return Object.keys(groupedProgrammes).sort((a, b) => new Date(a) - new Date(b));
  };

  // Fonction pour obtenir le numéro du jour
  const getDayNumber = (dateString, allDays) => {
    const sortedDays = [...allDays].sort((a, b) => new Date(a) - new Date(b));
    return sortedDays.indexOf(dateString) + 1;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  // Définir automatiquement le premier jour comme actif
  useEffect(() => {
    if (forum?.programmes && forum.programmes.length > 0 && !activeDay) {
      const groupedProgrammes = groupProgrammesByDay(forum.programmes);
      const sortedDays = getSortedDays(groupedProgrammes);
      if (sortedDays.length > 0) {
        setActiveDay(sortedDays[0]);
      }
    }
  }, [forum?.programmes, activeDay]);
  
  // Afficher le loading si le forum n'est pas encore chargé
  if (!forum) {
    return <Loading />;
  }
  
  return (
    <div className="forum-infos-wrapper">
      <div className="forum-infos-container">
      {/* Partie gauche : description */}
      <div className="forum-infos-left">
        <h2 className="forum-infos-title">Bienvenue !</h2>
        <p className="forum-infos-description">{forum.description}</p>
        {forum.highlight && (
          <p className="forum-infos-highlight">{forum.highlight}</p>
        )}
        
        {/* Section dates clés - uniquement pour les forums virtuels */}
        {(forum.type === 'virtuel' || forum.is_virtual) && (
          <div className="forum-key-dates-section">
            <h3 className="key-dates-title">Les dates clés :</h3>
            <div className="key-dates-timeline">
              {forum.preparation_start && (
                <div className="key-date-item">
                  <div className="key-date-dot"></div>
                  <div className="key-date-content">
                    <div className="key-date-label">
                      À partir du {new Date(forum.preparation_start).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    <div className="key-date-description">
                      Ouverture des inscriptions et des candidatures
                    </div>
                  </div>
                </div>
              )}
              {forum.jobdating_start && (
                <div className="key-date-item">
                  <div className="key-date-dot"></div>
                  <div className="key-date-content">
                    <div className="key-date-label">
                      À partir du {new Date(forum.jobdating_start).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    <div className="key-date-description">
                      Traitement des candidatures
                    </div>
                  </div>
                </div>
              )}
              {forum.interview_end && (
                <div className="key-date-item">
                  <div className="key-date-dot"></div>
                  <div className="key-date-content">
                    <div className="key-date-label">
                      Le {new Date(forum.interview_end).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    <div className="key-date-description">
                      Fermeture des candidatures
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Timeline des programmes intégrée directement sous la description */}
        <div className="forum-programmes-section">
          <h3 className="programme-timeline-title">Programme</h3>
          {forum.programmes && forum.programmes.length > 0 ? (
            <div className="programme-tabs-container">
              {/* Sélection des jours */}
              <div className="programme-days-selector">
                {(() => {
                  const groupedProgrammes = groupProgrammesByDay(forum.programmes);
                  const sortedDays = getSortedDays(groupedProgrammes);
                  
                  return sortedDays.map(dateKey => {
                    const dayNumber = getDayNumber(dateKey, sortedDays);
                    const isActive = activeDay === dateKey;
                    
                    return (
                      <button
                        key={dateKey}
                        className={`day-selector-card ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveDay(dateKey)}
                      >
                        <div className="day-card-content">
                          <div className="day-card-title">Jour {dayNumber.toString().padStart(2, '0')}</div>
                          <div className="day-card-date">{formatDate(dateKey)}</div>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Contenu du jour actif */}
              {activeDay && (
                <div className="programme-tab-content">
                  {(() => {
                    const groupedProgrammes = groupProgrammesByDay(forum.programmes);
                    const dayProgrammes = groupedProgrammes[activeDay] || [];
                    
                    return (
                      <div className="event-cards-grid">
                        {dayProgrammes.map(programme => (
                          <EventCard
                            key={programme.id}
                            event={programme}
                            forumId={forum.id}
                            showActions={false}
                            showSpeaker={true}
                            formatTime={formatTime}
                            formatDate={(dateString) => {
                              if (!dateString) return '';
                              const date = new Date(dateString);
                              return date.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                            }}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <p className="programme-timeline-empty">Aucun programme disponible pour le moment.</p>
          )}
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
          <span>{forum.companies ? forum.companies.length : 0} Entreprises</span>
        </div>

        <div className="forum-detail-line">
          <span>Plus de {recruiterCount} recruteurs n'attendent que toi !</span>
          <div className="forum-recruiters-logo-list">
            {forum.companies && forum.companies.slice(0, 5).map((company, idx) => (
            <img
  key={idx}
  src={company.logo ? (company.logo.startsWith('http') ? company.logo : `${baseURL}${company.logo}`) : LogoCompany}
  alt={company.name}
  className="forum-recruiter-logo"
  onError={(e) => { e.target.onerror = null; e.target.src = LogoCompany; }}
/>
            ))}
            {forum.companies && forum.companies.length > 5 && (
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
    </div>
  );
};

export default ForumInfos;
