import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faMapMarkerAlt,
  faSave,
  faTimes,
  faCalendarDays,
  faCalendarAlt,
  faUser,
  faChevronDown,
  faChevronRight,
  faCalendarDay
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/common';
import Modal from '../../../../components/card/common/Modal';
import EventCard from '../../../../components/card/common/EventCard';
import './ProgrammeManager.css';
import { validateEventDates } from '../../../../utils/dateValidation';
import DateValidationError from '../../../../utils/DateValidationError';

const ProgrammeManager = ({ forumId, forumName, forumDates }) => {
  const [programmes, setProgrammes] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo: null,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    speakers: []
  });
  const [isSpeakerDropdownOpen, setIsSpeakerDropdownOpen] = useState(false);
  const [dateErrors, setDateErrors] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchProgrammes();
    fetchSpeakers();
  }, [forumId]);

  // Définir automatiquement le premier jour comme actif
  useEffect(() => {
    if (programmes.length > 0 && !activeDay) {
      const groupedProgrammes = groupProgrammesByDay(programmes);
      const sortedDays = getSortedDays(groupedProgrammes);
      if (sortedDays.length > 0) {
        setActiveDay(sortedDays[0]);
      }
    }
  }, [programmes, activeDay]);

  // Fermer le dropdown des speakers quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSpeakerDropdownOpen && !event.target.closest('.multiselect-container')) {
        setIsSpeakerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSpeakerDropdownOpen]);

  const fetchProgrammes = async () => {
    try {
      console.log('🔍 [FRONTEND] ProgrammeManager - fetchProgrammes - Début avec forumId:', forumId);
      setIsLoading(true);
      const url = `${API}/forums/${forumId}/programmes/`;
      console.log('🔍 [FRONTEND] ProgrammeManager - fetchProgrammes - URL:', url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('🔍 [FRONTEND] ProgrammeManager - fetchProgrammes - Réponse reçue:', response.data);
      if (response.data.length > 0) {
        console.log('🔍 [FRONTEND] ProgrammeManager - Premier programme speakers:', response.data[0].speakers);
      }
      setProgrammes(response.data);
    } catch (err) {
      console.error('🔍 [FRONTEND] ProgrammeManager - fetchProgrammes - Erreur:', err);
      setError('Erreur lors du chargement des programmes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      console.log('🔍 [FRONTEND] ProgrammeManager - fetchSpeakers - Début');
      const response = await axios.get(`${API}/forums/speakers/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('🔍 [FRONTEND] ProgrammeManager - fetchSpeakers - Réponse reçue:', response.data);
      setSpeakers(response.data);
    } catch (err) {
      console.error('🔍 [FRONTEND] ProgrammeManager - fetchSpeakers - Erreur:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    let newFormData;
    
    if (name === 'photo' && files) {
      newFormData = {
        ...formData,
        [name]: files[0]
      };
    } else {
      newFormData = {
        ...formData,
        [name]: value
      };
    }
    
    setFormData(newFormData);
    
    // Validation en temps réel pour les dates
    if (['start_date', 'end_date', 'start_time', 'end_time'].includes(name)) {
      const validation = validateEventDates(newFormData, forumDates);
      setDateErrors(validation.errors);
    }
  };

  const handleSpeakerToggle = (speakerId) => {
    setFormData(prev => {
      const currentSpeakers = prev.speakers;
      const isSelected = currentSpeakers.includes(speakerId);
      
      if (isSelected) {
        return {
          ...prev,
          speakers: currentSpeakers.filter(id => id !== speakerId)
        };
      } else {
        return {
          ...prev,
          speakers: [...currentSpeakers, speakerId]
        };
      }
    });
  };

  const getSelectedSpeakers = () => {
    return speakers.filter(speaker => formData.speakers.includes(speaker.id));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      photo: null,
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      location: '',
      speakers: []
    });
    setEditingProgramme(null);
    setShowAddForm(false);
    setIsSpeakerDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Données du formulaire:', formData);
    
    // Validation des champs obligatoires
    if (!formData.title || !formData.location) {
      setError('Le titre et le lieu sont obligatoires');
      return;
    }
    
    // Validation des dates - FORCER LA VALIDATION
    const dateValidation = validateEventDates(formData, forumDates);
    console.log('Validation des dates:', dateValidation);
    
    if (!dateValidation.isValid) {
      const errorMessage = dateValidation.errors.join('\n');
      console.log('Erreurs de validation:', errorMessage);
      setError(errorMessage);
      setDateErrors(dateValidation.errors);
      alert('ERREUR: ' + errorMessage); // FORCER L'ALERTE
      return;
    }
    
    console.log('Validation OK, soumission en cours...');
    
    // Effacer les erreurs si validation OK
    setDateErrors([]);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      formDataToSend.append('location', formData.location);
      formData.speakers.forEach(speakerId => {
        formDataToSend.append('speakers', speakerId);
      });
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      if (editingProgramme) {
        await axios.put(`${API}/forums/${forumId}/programmes/${editingProgramme.id}/update/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API}/forums/${forumId}/programmes/create/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      resetForm();
      fetchProgrammes();
      setError(null); // Effacer les erreurs précédentes
    } catch (err) {
      setError('Erreur lors de la sauvegarde du programme');
      console.error(err);
    }
  };

  const handleEdit = (programme) => {
    setEditingProgramme(programme);
    setFormData({
      title: programme.title,
      description: programme.description,
      photo: null, // On ne peut pas pré-remplir un fichier
      start_date: programme.start_date,
      end_date: programme.end_date,
      start_time: programme.start_time,
      end_time: programme.end_time,
      location: programme.location,
      speakers: programme.speakers.map(s => s.id)
    });
    setShowAddForm(true);
  };

  const handleDelete = async (programmeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      try {
        await axios.delete(`${API}/forums/${forumId}/programmes/${programmeId}/delete/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchProgrammes();
      } catch (err) {
        setError('Erreur lors de la suppression du programme');
        console.error(err);
      }
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

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
    const sortedDays = allDays.sort((a, b) => new Date(a) - new Date(b));
    return sortedDays.indexOf(dateString) + 1;
  };

  // Fonction pour définir le jour actif
  const setActiveDayHandler = (dateKey) => {
    setActiveDay(dateKey);
  };

  // Fonction pour pré-remplir les dates du forum
  const prefillForumDates = () => {
    if (forumDates && forumDates.start_date && forumDates.end_date) {
      setFormData(prev => ({
        ...prev,
        start_date: forumDates.start_date,
        end_date: forumDates.end_date
      }));
    }
  };



  if (isLoading) {
    return <div className="programme-manager-loading">Chargement...</div>;
  }

     return (
     <div className="programme-manager">

        <div className="programme-manager-header">
          <button 
            className="add-programme-btn"
            onClick={() => {
              prefillForumDates();
              setShowAddForm(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
            Ajouter un programme
          </button>
        </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      <Modal
        isOpen={showAddForm}
        onClose={resetForm}
        title={editingProgramme ? 'Modifier le programme' : 'Ajouter un programme'}
        size="large"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} />
              Titre du programme *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="modal-form-input"
              placeholder="Ex: Conférence sur l'innovation"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faCalendarDays} />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="modal-form-textarea"
              placeholder="Décrivez le contenu du programme..."
              rows={3}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} />
              Photo du programme
            </label>
            <input
              type="file"
              name="photo"
              onChange={handleInputChange}
              accept="image/*"
              className="modal-form-input"
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Formats acceptés : JPG, PNG, GIF</small>
            {editingProgramme && editingProgramme.photo && (
              <div className="current-photo" style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Photo actuelle :</p>
                <img 
                  src={editingProgramme.photo.startsWith('http') ? editingProgramme.photo : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${editingProgramme.photo}`}
                  alt="Photo actuelle"
                  className="current-photo-img"
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Date de début *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="modal-form-input"
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Date de fin *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="modal-form-input"
                required
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Heure de début
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="modal-form-input"
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Heure de fin
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className="modal-form-input"
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Lieu *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="modal-form-input"
              placeholder="Ex: Salle de conférence A, Toulouse"
              required
            />
          </div>

              {/* Affichage des erreurs de validation des dates */}
              <DateValidationError 
                errors={dateErrors} 
                show={dateErrors.length > 0} 
              />

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <FontAwesomeIcon icon={faUser} />
                  Speakers
                </label>
                <div className="multiselect-container">
                  <button
                    type="button"
                    className="multiselect-trigger"
                    onClick={() => setIsSpeakerDropdownOpen(!isSpeakerDropdownOpen)}
                  >
                    <span className="multiselect-label">
                      {formData.speakers.length === 0 
                        ? 'Sélectionner des speakers' 
                        : `${formData.speakers.length} speaker${formData.speakers.length > 1 ? 's' : ''} sélectionné${formData.speakers.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <span className={`multiselect-arrow ${isSpeakerDropdownOpen ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {isSpeakerDropdownOpen && (
                    <div className="multiselect-dropdown">
                      <div className="multiselect-header">Speakers</div>
                      <div className="multiselect-options">
                        {speakers.map(speaker => (
                          <label key={speaker.id} className="multiselect-option">
                            <input
                              type="checkbox"
                              checked={formData.speakers.includes(speaker.id)}
                              onChange={() => handleSpeakerToggle(speaker.id)}
                            />
                            <span className="multiselect-option-text">
                              {speaker.full_name} - {speaker.position}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.speakers.length > 0 && (
                    <div className="selected-speakers">
                      {getSelectedSpeakers().map(speaker => (
                        <span key={speaker.id} className="selected-speaker-tag">
                          {speaker.full_name}
                          <button
                            type="button"
                            onClick={() => handleSpeakerToggle(speaker.id)}
                            className="remove-speaker-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Annuler
                </button>
                <Button 
                  type="submit" 
                  variant="save"
                  disabled={dateErrors.length > 0}
                  icon={<FontAwesomeIcon icon={faSave} />}
                  onClick={(e) => {
                    if (dateErrors.length > 0) {
                      e.preventDefault();
                      alert('Impossible de soumettre : ' + dateErrors.join('\n'));
                    }
                  }}
                >
                  {editingProgramme ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
        </form>
      </Modal>

      {/* Interface avec onglets pour les jours */}
      <div className="programme-tabs-container">
        {programmes.length === 0 ? (
          <div className="no-programmes">
            <p>Aucun programme ajouté pour le moment.</p>
            <button onClick={() => {
              prefillForumDates();
              setShowAddForm(true);
            }}>
              <FontAwesomeIcon icon={faPlus} />
              Ajouter le premier programme
            </button>
          </div>
        ) : (
          <>
            {/* Sélection des jours */}
            <div className="programme-days-selector">
              {(() => {
                const groupedProgrammes = groupProgrammesByDay(programmes);
                const sortedDays = getSortedDays(groupedProgrammes);
                
                return sortedDays.map(dateKey => {
                  const dayNumber = getDayNumber(dateKey, sortedDays);
                  const isActive = activeDay === dateKey;
                  
                  return (
                    <button
                      key={dateKey}
                      className={`day-selector-card ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveDayHandler(dateKey)}
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
                  const groupedProgrammes = groupProgrammesByDay(programmes);
                  const dayProgrammes = groupedProgrammes[activeDay] || [];
                  
                  return (
                    <div className="event-cards-grid">
                      {dayProgrammes.map(programme => (
                        <EventCard
                          key={programme.id}
                          event={programme}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showActions={true}
                          showSpeaker={true}
                          formatTime={formatTime}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammeManager; 