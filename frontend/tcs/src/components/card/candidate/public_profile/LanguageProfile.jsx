// src/pages/candidate/section/LanguageProfile.jsx
import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { MdLeaderboard } from 'react-icons/md';

const LanguageProfile = ({ formData }) => {
  const candidate_languages = formData.candidate_languages && formData.candidate_languages.length > 0
    ? formData.candidate_languages
    : [];

  return (
    <div className="section education-section">
      <h3 className="language-title">Langues</h3>
      {candidate_languages.map((lang, index) => (
        <div key={index} className="language-item-modern read-only-item">
          <div className="input-modern read-only">
            <span className="input-icon"><FaGlobe /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Langue</label>
              <div className="read-only-value">{lang.language || '-'}</div>
            </div>
          </div>

          <div className="input-modern read-only">
            <span className="input-icon"><MdLeaderboard /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Niveau</label>
              <div className="read-only-value">{lang.level || '-'}</div>
            </div>
          </div>
        </div>
      ))}
      {candidate_languages.length === 0 && (
        <p className="read-only-empty">Aucune langue renseignée.</p>
      )}
    </div>
  );
};

export default LanguageProfile;
