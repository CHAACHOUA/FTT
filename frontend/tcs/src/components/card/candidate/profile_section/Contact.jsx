import React from 'react';
import '../../../../pages/styles/candidate/Contact.css';
import { FaPhone, FaEnvelope } from 'react-icons/fa';

const Contact = ({ formData, onUpdate = () => {}, readOnly = false, children }) => {
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (!readOnly) onUpdate({ [name]: value });
  };

  return (
    <div className="contact-section">
      <h3 className="contact-title">Contact</h3>

      {/* Téléphone */}
      <div className="input-modern">
        <div className="input-icon-country">
          <span className="input-icon"><FaPhone /></span>
          <span className="country-flag">🇫🇷</span>
          <span className="country-code">(+33)</span>
        </div>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.phone ? 'filled' : ''}`}>
            Téléphone <span className="required">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ''}
            onChange={handleFieldChange}
            autoComplete="tel"
            disabled={readOnly}
          />
          {!readOnly && formData.phone && (
            <span className="clear-btn" onClick={() => onUpdate({ phone: '' })}>✕</span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="input-modern">
        <span className="input-icon"><FaEnvelope /></span>
        <div className="input-wrapper-modern">
          <label className={`floating-label ${formData.email ? 'filled' : ''}`}>
            Mail <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleFieldChange}
            autoComplete="email"
            disabled={readOnly}
          />
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default Contact;
