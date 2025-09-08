import React from 'react';
import '../../styles/candidate/Presentation.css';
import { FaUser, FaVenusMars, FaCamera, FaFileAlt } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '??';
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const getProfilePictureURL = (profile_picture) => {
  if (!profile_picture) return null;
  if (typeof profile_picture === 'string') {
    return profile_picture.startsWith('http')
      ? profile_picture
      : `${API_URL}${profile_picture}`;
  }
  return URL.createObjectURL(profile_picture);
};

const Presentation = ({ formData, onUpdate = () => {}, readOnly = false }) => {
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (!readOnly) onUpdate({ [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (readOnly) return;
    if (file && file.size <= 2 * 1024 * 1024) {
      onUpdate({ profile_picture: file });
    } else {
      alert('Fichier trop volumineux (max 2Mo)');
    }
  };

  return (
    <div className="presentation-section">
      <h3 className="presentation-title">Votre profil</h3>

      {/* Photo de profil */}
      <div className="profile-photo-container">
        {formData.profile_picture ? (
          <img
            src={getProfilePictureURL(formData.profile_picture)}
            alt="Photo de profil"
            className="profile-photo"
          />
        ) : (
          <div className="profile-initials-circle">
            {getInitials(formData.first_name, formData.last_name)}
          </div>
        )}

        {!readOnly && (
          <label htmlFor="profile_picture" className="upload-photo-btn">
            <FaCamera /> Importer une photo (recommandé)
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/png, image/jpeg"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Civilité */}
      <div className="input-modern">
        <span className="input-icon"><FaVenusMars /></span>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.title ? 'filled' : ''}`}>
            Civilité <span className="required">*</span>
          </label>
          <select
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleFieldChange}
            className="modern-select"
            disabled={readOnly}
          >
            <option value="" disabled hidden></option>
            <option value="Monsieur">Monsieur</option>
            <option value="Madame">Madame</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      {/* Prénom */}
      <div className="input-modern">
        <span className="input-icon"><FaUser /></span>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.first_name ? 'filled' : ''}`}>
            Prénom <span className="required">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleFieldChange}
            autoComplete="given-name"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Nom */}
      <div className="input-modern">
        <span className="input-icon"><FaUser /></span>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.last_name ? 'filled' : ''}`}>
            Nom <span className="required">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleFieldChange}
            autoComplete="family-name"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Biographie */}
      <div className="input-modern">
        <span className="input-icon"><FaFileAlt /></span>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.bio ? 'filled' : ''}`}>
          
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleFieldChange}
            disabled={readOnly}
            rows={4}
            placeholder="Parlez-nous de vous, de vos passions, de vos objectifs professionnels..."
            className="modern-textarea"
          />
        </div>
      </div>
    </div>
  );
};

export default Presentation;
