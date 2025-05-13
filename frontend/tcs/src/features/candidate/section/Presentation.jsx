// src/features/candidate/section/Presentation.jsx
import React from 'react';
import '../../styles/candidate/Presentation.css';
import { FaUser, FaVenusMars } from 'react-icons/fa';

const Presentation = ({ formData, onUpdate }) => {
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  return (
    <div className="presentation-section">
      <h3 className="presentation-title">Votre profil</h3>

      {/* Civilité (title) */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Presentation;
