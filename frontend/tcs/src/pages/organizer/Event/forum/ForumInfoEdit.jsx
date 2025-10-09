import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaImage, FaCalendarAlt, FaFileAlt, FaTag, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../../../../components/loyout/NavBar';
import '../../../../pages/styles/candidate/Presentation.css';
import '../common/Dashboard.css';
import { getForumTypesForSelect } from '../../../../constants/choices';
import { validateEventDates } from '../../../../utils/dateValidation';
import DateValidationError from '../../../../utils/DateValidationError';
import { useAuth } from '../../../../context/AuthContext';

const ForumInfoEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { forum, apiBaseUrl: API, forumId } = location.state || {};
  
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
  const [forumTypes, setForumTypes] = useState([]);
  const [choicesLoading, setChoicesLoading] = useState(true);
  const [dateErrors, setDateErrors] = useState([]);
  const [forumData, setForumData] = useState(forum);
  const [error, setError] = useState(null);

  const handleBack = () => {
    navigate('/event/organizer/dashboard', { 
      state: { 
        apiBaseUrl: API,
        forumId: forumId || forumData?.id,
        // Flag pour indiquer que le forum a été mis à jour
        forumUpdated: true
      }
    });
  };

  useEffect(() => {
    const loadChoices = async () => {
      try {
        setChoicesLoading(true);
        const forumTypesData = await getForumTypesForSelect();
        setForumTypes(forumTypesData);
      } catch (error) {
        console.error('Erreur lors du chargement des types de forum:', error);
        // Fallback vers les options par défaut
        setForumTypes([
          { value: 'presentiel', label: 'Présentiel' },
          { value: 'virtuel', label: 'Virtuel' },
          { value: 'hybride', label: 'Hybride' }
        ]);
      } finally {
        setChoicesLoading(false);
      }
    };

    loadChoices();
  }, []);

  // Récupérer les données du forum si elles ne sont pas disponibles
  useEffect(() => {
    const fetchForumData = async () => {
      // Attendre que l'authentification soit vérifiée
      if (isAuthLoading) {
        return;
      }
      
      if (!isAuthenticated) {
        setError('Vous devez être connecté pour accéder à cette page.');
        setInitialLoading(false);
        return;
      }
      
      const apiUrl = API || process.env.REACT_APP_API_BASE_URL;
      
      if (!apiUrl) {
        setError('Configuration API manquante.');
        setInitialLoading(false);
        return;
      }

      // Si on a déjà les données du forum, les utiliser
      if (forum) {
        console.log('Forum reçu:', forum);
        console.log('Photo du forum:', forum.photo);
        setForumData(forum);
        setFormData({
          name: forum.name || '',
          description: forum.description || '',
          start_date: forum.start_date || '',
          end_date: forum.end_date || '',
          start_time: forum.start_time || '09:00',
          end_time: forum.end_time || '17:00',
          type: forum.type || 'presentiel',
          photo: null
        });
        setInitialLoading(false);
        return;
      }

      // Sinon, récupérer les données du forum via API
      if (forumId) {
        try {
          const response = await axios.get(`${apiUrl}/forums/${forumId}/`, {
            withCredentials: true // Utiliser les cookies HttpOnly
          });
          const fetchedForum = response.data;
          console.log('Forum récupéré via API:', fetchedForum);
          setForumData(fetchedForum);
          setFormData({
            name: fetchedForum.name || '',
            description: fetchedForum.description || '',
            start_date: fetchedForum.start_date || '',
            end_date: fetchedForum.end_date || '',
            start_time: fetchedForum.start_time || '09:00',
            end_time: fetchedForum.end_time || '17:00',
            type: fetchedForum.type || 'presentiel',
            photo: null
          });
        } catch (error) {
          console.error('Erreur lors de la récupération du forum:', error);
          setError('Impossible de récupérer les données du forum');
        } finally {
          setInitialLoading(false);
        }
      } else {
        setError('ID du forum manquant');
        setInitialLoading(false);
      }
    };

    fetchForumData();
  }, [forum, forumId, API, isAuthenticated, isAuthLoading]);

  const getPhotoURL = (photo) => {
    console.log('getPhotoURL appelé avec:', photo);
    if (!photo) {
      console.log('Photo est null/undefined');
      return null;
    }
    if (typeof photo === 'string') {
      if (photo.startsWith('http')) return photo;
      const mediaBaseUrl = process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000';
      const url = `${mediaBaseUrl}${photo}`;
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
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Validation en temps réel pour les dates
    if (['start_date', 'end_date', 'start_time', 'end_time'].includes(name)) {
      const validation = validateEventDates(newFormData);
      setDateErrors(validation.errors);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation du type de forum
      const validTypes = forumTypes.map(ft => ft.value);
      if (!validTypes.includes(formData.type)) {
        toast.error('Type de forum invalide. Veuillez sélectionner un type valide.');
        setLoading(false);
        return;
      }

      // Validation des dates
      const dateValidation = validateEventDates(formData);
      if (!dateValidation.isValid) {
        dateValidation.errors.forEach(error => {
          toast.error(error);
        });
        setDateErrors(dateValidation.errors);
        setLoading(false);
        return;
      }
      
      // Effacer les erreurs si validation OK
      setDateErrors([]);

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
        `${API}/forums/${forum.id}/update/`,
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true // Utiliser les cookies HttpOnly
        }
      );

      toast.success('Forum mis à jour avec succès !');
      
      // Rediriger vers le dashboard après un délai
      setTimeout(() => {
        navigate('/event/organizer/dashboard/', { 
          state: { 
            forumId: forumData.id,
            apiBaseUrl: API,
            // Flag pour indiquer que le forum a été mis à jour
            forumUpdated: true
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

  if (isAuthLoading || initialLoading) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Chargement des informations du forum...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!forumData) {
    return (
      <div style={{ paddingTop: '70px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Forum non trouvé</h2>
          <p>Impossible de charger les informations du forum.</p>
          <button 
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      <Navbar />
      <div className="dashboard-bg">
        <div className="forum-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="organizer-header-block">
          <div className="organizer-header-with-forum">
                         <button onClick={handleBack} className="organizer-btn-back">
               <FaArrowLeft /> Retour
             </button>
            {forumData && (
              <div className="forum-details">
                <h2 className="forum-title">{forumData.name}</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{forumData.start_date && forumData.end_date ? `${forumData.start_date} - ${forumData.end_date}` : 'Dates non définies'}</span>
                </div>
              </div>
            )}
            {!forumData && (
              <div className="forum-details">
                <h2 className="forum-title">Forum non défini</h2>
                <div className="forum-date-range">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>Dates non disponibles</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="page-title-section">
          <h1>Gérer les informations du forum</h1>
          <p>Modifiez les détails de votre forum : {forumData?.name}</p>
        </div>

        <div className="presentation-section" style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px',width: '100%' ,}}>
          <form onSubmit={handleSubmit}>
            {/* Photo du forum */}
            <div className="profile-photo-container">
              {(() => {
                console.log('Affichage photo - formData.photo:', formData.photo);
                console.log('Affichage photo - forumData.photo:', forumData?.photo);
                
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
                } else if (forumData?.photo) {
                  console.log('Affichage ancienne photo');
                  return (
                    <img
                      src={getPhotoURL(forumData.photo)}
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

            {/* Affichage des erreurs de validation des dates */}
            <DateValidationError 
              errors={dateErrors} 
              show={dateErrors.length > 0} 
            />

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

                         {/* Bouton d'action */}
             <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '30px' }}>
               <button
                 type="submit"
                 disabled={loading}
                 className="organizer-save-btn"
                 style={{
                   cursor: loading ? 'not-allowed' : 'pointer',
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
    </div>
  );
};
  
export default ForumInfoEdit; 