// src/features/candidate/section/Experience.jsx
import React from 'react';
import '../../styles/candidate/Education.css';
import { FaBriefcase, FaBuilding, FaRegStickyNote, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { BsCalendar } from 'react-icons/bs';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const Experience = ({ formData, onUpdate }) => {
  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.experiences || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    onUpdate({ experiences: updatedList });
  };

  const addExperience = () => {
    onUpdate({
      experiences: [
        ...(formData.experiences || []),
        { job_title: '', company: '', start_month: '', start_year: '', end_month: '', end_year: '', description: '' }
      ],
    });
  };

  const removeExperience = (index) => {
    const updatedList = formData.experiences.filter((_, i) => i !== index);
    onUpdate({ experiences: updatedList });
  };

  // Toujours au moins un bloc vide
  const experiences = (formData.experiences && formData.experiences.length > 0)
    ? formData.experiences
    : [{ job_title: '', company: '', start_month: '', start_year: '', end_month: '', end_year: '', description: '' }];

  return (
    <div className="section education-section">
      <h3 className="experience-title">Expériences</h3>
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item-modern">
          <div className="input-modern">
            <span className="input-icon"><FaBriefcase /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${exp.job_title ? 'filled' : ''}`}>Titre du poste</label>
              <input
                type="text"
                value={exp.job_title}
                onChange={(e) => handleListChange(index, 'job_title', e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="input-modern">
            <span className="input-icon"><FaBuilding /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${exp.company ? 'filled' : ''}`}>Entreprise</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleListChange(index, 'company', e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Dates en grille moderne */}
          <div className="date-grid-row">
            <div className="date-group">
              <div className="date-group-label">Début</div>
              <div className="date-grid">
                <div className="date-select-col">
                  <label className="modern-label-date">Mois *</label>
                  <select
                    className="modern-date-select"
                    value={exp.start_month || ''}
                    onChange={e => handleListChange(index, 'start_month', e.target.value)}
                  >
                    <option value="">Mois</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="date-select-col">
                  <label className="modern-label-date">Année *</label>
                  <select
                    className="modern-date-select"
                    value={exp.start_year || ''}
                    onChange={e => handleListChange(index, 'start_year', e.target.value)}
                  >
                    <option value="">Année</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="date-group">
              <div className="date-group-label">Fin</div>
              <div className="date-grid">
                <div className="date-select-col">
                  <label className="modern-label-date">Mois *</label>
                  <select
                    className="modern-date-select"
                    value={exp.end_month || ''}
                    onChange={e => handleListChange(index, 'end_month', e.target.value)}
                  >
                    <option value="">Mois</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="date-select-col">
                  <label className="modern-label-date">Année *</label>
                  <select
                    className="modern-date-select"
                    value={exp.end_year || ''}
                    onChange={e => handleListChange(index, 'end_year', e.target.value)}
                  >
                    <option value="">Année</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="input-modern">
            <span className="input-icon"><FaRegStickyNote /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${exp.description ? 'filled' : ''}`}>Description</label>
              <textarea
           
                value={exp.description}
                onChange={(e) => handleListChange(index, 'description', e.target.value)}
                rows={2}
                className="modern-textarea"
              />
            </div>
          </div>
          {formData.experiences && formData.experiences.length > 0 && (
            <div className="remove-btn-modern-wrapper">
              <button className="remove-btn-modern" onClick={() => removeExperience(index)}>
                <FaTrash style={{ marginRight: 6 }} /> Supprimer
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="add-btn-modern" onClick={addExperience} style={{ marginTop: '10px' }}>
        <FaPlusCircle className="add-btn-icon" /> Ajouter
      </button>
    </div>
  );
};

export default Experience;
