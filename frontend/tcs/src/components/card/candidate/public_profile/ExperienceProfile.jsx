// components/candidate/ExperienceProfile.jsx
import React from 'react';
import { FaBriefcase, FaBuilding, FaRegStickyNote } from 'react-icons/fa';
import '../../../../pages/styles/candidate/Education.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  return `${months[parseInt(month, 10) - 1]} ${year}`;
};

const ExperienceProfile = ({ formData }) => {
  const experiences = formData.experiences || [];

  return (
    <div className="section education-section">
      <h3 className="experience-title">Expériences</h3>

      {experiences.length === 0 && (
        <p className="no-record-message">Aucune expérience enregistrée.</p>
      )}

      {experiences.map((exp, index) => (
        <div key={index} className="experience-item-modern">
          <div className="input-modern">
            <span className="input-icon"><FaBriefcase /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Titre du poste</label>
              <div>{exp.job_title}</div>
            </div>
          </div>

          <div className="input-modern">
            <span className="input-icon"><FaBuilding /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Entreprise</label>
              <div>{exp.company}</div>
            </div>
          </div>

          <div className="date-grid-row">
            <div className="date-group">
              <div className="date-group-label">Début</div>
              <div className="date-grid">
                <div>{formatDate(exp.start_date)}</div>
              </div>
            </div>
            <div className="date-group">
              <div className="date-group-label">Fin</div>
              <div className="date-grid">
                <div>{formatDate(exp.end_date)}</div>
              </div>
            </div>
          </div>

          <div className="input-modern">
            <span className="input-icon"><FaRegStickyNote /></span>
            <div className="input-wrapper-modern">
              <label className="floating-label filled">Description</label>
              <div>{exp.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceProfile;
