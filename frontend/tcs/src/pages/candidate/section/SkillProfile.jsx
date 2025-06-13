// src/pages/candidate/section/SkillProfile.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';
import '../../styles/candidate/Education.css';

const SkillProfile = ({ formData }) => {
  const skills = (formData.skills && formData.skills.length > 0)
    ? formData.skills
    : [];

  return (
    <div className="section education-section">
      <h3 className="skill-title">Compétences</h3>

      {skills.length === 0 && (
        <p className="no-record-message">Aucune compétence enregistrée.</p>
      )}

      {skills.map((skill, index) => (
        <div key={index} className="skill-item-modern">
          <div className="input-modern read-only">
            <span className="input-icon"><FaStar /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Compétence</label>
              <input
                type="text"
                value={typeof skill === 'object' ? skill.name : skill}
                readOnly
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillProfile;
