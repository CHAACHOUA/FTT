import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaImage, FaCalendarAlt, FaFileAlt, FaTag } from 'react-icons/fa';
import Navbar from '../common/NavBar';
import '../styles/candidate/Presentation.css';
import './Event/Dashboard.css';

const ForumInfoEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { forum, accessToken, apiBaseUrl: API } = location.state || {};
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    type: 'presentiel',
    photo: null
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const forumTypes = [
    { value: 'presentiel', label: 'Présentiel' },
    { value: 'distance', label: 'À distance' },
    { value: 'hybride', label: 'Hybride' }
  ];

  useEffect(() => {
    if (forum) {
      console.log('Forum reçu:', forum);
      console.log('Photo du forum:', forum.photo);
      setFormData({
        name: forum.name || '',
        description: forum.description || '',
        start_date: forum.start_date || '',
        end_date: forum.end_date || '',
        start_time: forum.start_time || '09:00',
        end_time: forum.end_time || '17:00',
        type: forum.type || 'presentiel',
        photo: null // On ne met pas l'ancienne photo ici, elle sera affichée via getPhotoURL
      });
    }
    setInitialLoading(false);
  }, [forum]);

  const getPhotoURL = (photo) => {
    console.log('getPhotoURL appelé avec:', photo);
    if (!photo) {
      console.log('Photo est null/undefined');
      return null;
    }
    if (typeof photo === 'string') {
      const url = photo.startsWith('http') ? photo : `${API}${photo}`;
      console.log('URL générée:', url);
      return url;
    }
    if (photo instanceof File) {
      const url = URL.createObjectURL(photo);
      console.log('URL File générée:', url);
      return url;
    }
    console.log('Type de photo non reconnu:', typeof photo);
    return null;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB max
      setFormData(prev => ({ ...prev, photo: file }));
    } else {
      toast.error('Fichier trop volumineux (max 5Mo)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation du type de forum
      const validTypes = ['presentiel', 'distance', 'hybride'];
      if (!validTypes.includes(formData.type)) {
        toast.error('Type de forum invalide. Veuillez sélectionner un type valide.');
        setLoading(false);
        return;
      }

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('start_date', formData.start_date);
      formPayload.append('end_date', formData.end_date);
      formPayload.append('start_time', formData.start_time);
      formPayload.append('end_time', formData.end_time);
      formPayload.append('type', formData.type);

      console.log('Photo dans formData:', formData.photo);
      console.log('Type de photo:', typeof formData.photo);
      console.log('Est-ce un File?', formData.photo instanceof File);
      console.log('Type de forum:', formData.type);

      if (formData.photo instanceof File) {
        formPayload.append('photo', formData.photo);
        console.log('Photo ajoutée au FormData');
      } else {
        console.log('Photo non ajoutée - pas un File');
      }

      const response = await axios.put(
        `${API}/api/forums/${forum.id}/update/`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Forum mis à jour avec succès !');
      
      // Rediriger vers le dashboard après un délai
      setTimeout(() => {
        navigate('/event/organizer/dashboard/', { 
          state: { 
            forum: { ...forum, ...response.data },
            accessToken,
            apiBaseUrl: API 
          } 
        });
      }, 2000);

    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la mise à jour du forum';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Chargement...</div>;
  }

  if (!forum) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Forum non trouvé</h2>
          <p>Impossible de charger les informations du forum.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <Navbar />
      <div className="dashboard-bg">
        <div className="dashboard-header">
          <h1>Gérer les informations du forum</h1>
          <p>Modifiez les détails de votre forum</p>
        </div>

        <div className="presentation-section" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <form onSubmit={handleSubmit}>
            {/* Photo du forum */}
            <div className="profile-photo-container">
              {(() => {
                console.log('Affichage photo - formData.photo:', formData.photo);
                console.log('Affichage photo - forum.photo:', forum.photo);
                
                if (formData.photo) {
                  console.log('Affichage nouvelle photo');
                  return (
                    <img
                      src={getPhotoURL(formData.photo)}
                      alt="Photo du forum"
                      className="profile-photo"
                      style={{ borderRadius: '8px', maxWidth: '300px', maxHeight: '200px' }}
                    />
                  );
                } else if (forum.photo) {
                  console.log('Affichage ancienne photo');
                  return (
                    <img
                      src={getPhotoURL(forum.photo)}
                      alt="Photo du forum"
                      className="profile-photo"
                      style={{ borderRadius: '8px', maxWidth: '300px', maxHeight: '200px' }}
                    />
                  );
                                 } else {
                   console.log('Affichage placeholder');
                   return (
                     <div 
                       className="profile-initials-circle" 
                       style={{ 
                         fontSize: 48, 
                         width: '300px', 
                         height: '200px', 
                         borderRadius: '8px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         backgroundColor: '#f8f9fa',
                         border: '2px dashed #dee2e6',
                         color: '#6c757d'
                       }}
                     >
                       <div style={{ textAlign: 'center' }}>
                         <FaImage style={{ fontSize: '48px', marginBottom: '10px' }} />
                         <div>Aucune photo</div>
                       </div>
                     </div>
                   );
                 }
              })()}
              <label htmlFor="photo" className="upload-photo-btn">
                <FaImage /> Changer la photo
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Nom du forum */}
            <div className="input-modern">
              <span className="input-icon"><FaEdit /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.name ? 'filled' : ''}`}>
                  Nom du forum <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>

            {/* Type du forum */}
            <div className="input-modern">
              <span className="input-icon"><FaTag /></span>
              <div className="input-wrapper-modern">
                <label className="floating-label filled">
                  Type de forum <span className="required">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFieldChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                >
                  {forumTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date de début */}
            <div className="input-modern">
              <span className="input-icon"><FaCalendarAlt /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.start_date ? 'filled' : ''}`}>
                  Date de début <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>

            {/* Date de fin */}
            <div className="input-modern">
              <span className="input-icon"><FaCalendarAlt /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.end_date ? 'filled' : ''}`}>
                  Date de fin <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>

            {/* Heure de début */}
            <div className="input-modern">
              <span className="input-icon"><FaCalendarAlt /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.start_time ? 'filled' : ''}`}>
                  Heure de début <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>

            {/* Heure de fin */}
            <div className="input-modern">
              <span className="input-icon"><FaCalendarAlt /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.end_time ? 'filled' : ''}`}>
                  Heure de fin <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="input-modern">
              <span className="input-icon"><FaFileAlt /></span>
              <div className="input-wrapper-modern">
                <label className={`floating-label ${formData.description ? 'filled' : ''}`}>
                  Description du forum
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFieldChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button
                type="button"
                onClick={() => navigate('/event/organizer/dashboard/', { 
                  state: { forum, accessToken, apiBaseUrl: API } 
                })}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumInfoEdit; 