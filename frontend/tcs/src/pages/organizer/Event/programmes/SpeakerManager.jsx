import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSave,
  faTimes,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../context/AuthContext';
import Modal from '../../../../components/card/common/Modal';
import PersonCard from '../../../../components/card/common/PersonCard';
import './SpeakerManager.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const SpeakerManager = () => {
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    photo: null
  });
  const { accessToken } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      console.log('🔍 [FRONTEND] SpeakerManager - fetchSpeakers - Début');
      setIsLoading(true);
      const url = `${API}/forums/speakers/`;
      console.log('🔍 [FRONTEND] SpeakerManager - fetchSpeakers - URL:', url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('🔍 [FRONTEND] SpeakerManager - fetchSpeakers - Réponse reçue:', response.data);
      setSpeakers(response.data);
    } catch (err) {
      console.error('🔍 [FRONTEND] SpeakerManager - fetchSpeakers - Erreur:', err);
      setError('Erreur lors du chargement des speakers');
    } finally {
      setIsLoading(false);
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

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      position: '',
      photo: null
    });
    setEditingSpeaker(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('position', formData.position);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      if (editingSpeaker) {
        await axios.put(`${API}/forums/speakers/${editingSpeaker.id}/update/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API}/forums/speakers/create/`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      resetForm();
      fetchSpeakers();
    } catch (err) {
      setError('Erreur lors de la sauvegarde du speaker');
      console.error(err);
    }
  };

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker);
    setFormData({
      first_name: speaker.first_name,
      last_name: speaker.last_name,
      position: speaker.position,
      photo: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (speakerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce speaker ?')) {
      try {
        await axios.delete(`${API}/forums/speakers/${speakerId}/delete/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchSpeakers();
      } catch (err) {
        setError('Erreur lors de la suppression du speaker');
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return <div className="speaker-manager-loading">Chargement...</div>;
  }

  return (
    <div className="speaker-manager">
      <div className="speaker-manager-header">
        <h2>Gestion des Speakers</h2>
        <button 
          className="add-speaker-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Ajouter un speaker
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
        title={editingSpeaker ? 'Modifier le speaker' : 'Ajouter un speaker'}
        size="medium"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faUser} />
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="modal-form-input"
                placeholder="Ex: Jean"
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">
                <FontAwesomeIcon icon={faUser} />
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="modal-form-input"
                placeholder="Ex: Dupont"
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faUser} />
              Poste *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="modal-form-input"
              placeholder="Ex: Directeur Technique"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              <FontAwesomeIcon icon={faUser} />
              Photo
            </label>
            <input
              type="file"
              name="photo"
              onChange={handleInputChange}
              accept="image/*"
              className="modal-form-input"
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Formats acceptés : JPG, PNG, GIF</small>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={resetForm}>
              Annuler
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              <FontAwesomeIcon icon={faSave} />
              {editingSpeaker ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Liste des speakers */}
      <div className="speakers-list">
        {speakers.length === 0 ? (
          <div className="no-speakers">
            <p>Aucun speaker ajouté pour le moment.</p>
                         <button onClick={() => setShowAddForm(true)}>
               <FontAwesomeIcon icon={faPlus} />
               Ajouter le premier speaker
             </button>
          </div>
        ) : (
          <div className="person-cards-grid">
            {speakers.map(speaker => (
              <PersonCard
                key={speaker.id}
                person={speaker}
                type="speaker"
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
                showContact={false}
                showView={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakerManager; 