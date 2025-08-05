import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faClock, 
  faMapMarkerAlt, 
  faUser,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import './ProgrammeManager.css';

const ProgrammeManager = ({ forumId, forumName }) => {
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
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchProgrammes();
    fetchSpeakers();
  }, [forumId]);

  const fetchProgrammes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/api/forums/${forumId}/programmes/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setProgrammes(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des programmes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      const response = await axios.get(`${API}/api/forums/speakers/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSpeakers(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des speakers:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSpeakerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      speakers: selectedOptions
    }));
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        await axios.put(`${API}/api/forums/${forumId}/programmes/${editingProgramme.id}/update/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API}/api/forums/${forumId}/programmes/create/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      resetForm();
      fetchProgrammes();
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
        await axios.delete(`${API}/api/forums/${forumId}/programmes/${programmeId}/delete/`, {
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

  if (isLoading) {
    return <div className="programme-manager-loading">Chargement...</div>;
  }

  return (
    <div className="programme-manager">
      <div className="programme-manager-header">
        <h2>Gestion des programmes - {forumName}</h2>
        <button 
          className="add-programme-btn"
          onClick={() => setShowAddForm(true)}
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
      {showAddForm && (
        <div className="programme-form-overlay">
          <div className="programme-form">
            <div className="form-header">
              <h3>{editingProgramme ? 'Modifier le programme' : 'Ajouter un programme'}</h3>
              <button className="close-btn" onClick={resetForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Photo du programme</label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                  <small>Formats acceptés : JPG, PNG, GIF (max 5MB)</small>
                  {editingProgramme && editingProgramme.photo && (
                    <div className="current-photo">
                      <p>Photo actuelle :</p>
                      <img 
                        src={editingProgramme.photo.startsWith('http') ? editingProgramme.photo : `${API}${editingProgramme.photo}`}
                        alt="Photo actuelle"
                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Heure de début</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Heure de fin</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lieu *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Speakers</label>
                  <select
                    multiple
                    name="speakers"
                    value={formData.speakers}
                    onChange={handleSpeakerChange}
                    size="4"
                  >
                    {speakers.map(speaker => (
                      <option key={speaker.id} value={speaker.id}>
                        {speaker.full_name} - {speaker.position}
                      </option>
                    ))}
                  </select>
                  <small>Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs speakers</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  <FontAwesomeIcon icon={faSave} />
                  {editingProgramme ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des programmes */}
      <div className="programmes-list">
        {programmes.length === 0 ? (
          <div className="no-programmes">
            <p>Aucun programme ajouté pour le moment.</p>
            <button onClick={() => setShowAddForm(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Ajouter le premier programme
            </button>
          </div>
        ) : (
          programmes.map(programme => (
            <div key={programme.id} className="programme-card">
              <div className="programme-header">
                <h4>{programme.title}</h4>
                <div className="programme-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(programme)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(programme.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {programme.photo && (
                <div className="programme-photo">
                  <img 
                    src={programme.photo.startsWith('http') ? programme.photo : `${API}${programme.photo}`}
                    alt={programme.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {programme.description && (
                <p className="programme-description">{programme.description}</p>
              )}

              <div className="programme-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>
                    {formatDate(programme.start_date)} - {formatDate(programme.end_date)}
                    {programme.start_time && programme.end_time && (
                      <span> • {formatTime(programme.start_time)} - {formatTime(programme.end_time)}</span>
                    )}
                  </span>
                </div>

                <div className="detail-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{programme.location}</span>
                </div>

                {programme.speakers && programme.speakers.length > 0 && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faUser} />
                    <div className="speakers-list">
                      {programme.speakers.map(speaker => (
                        <span key={speaker.id} className="speaker-tag">
                          {speaker.full_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgrammeManager; 