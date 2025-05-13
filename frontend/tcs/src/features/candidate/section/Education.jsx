// src/features/candidate/section/Education.jsx
import React from 'react';
import '../../styles/candidate/Education.css';
import { FaUniversity } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { BsCalendar } from 'react-icons/bs';
import { FaTrash, FaPlusCircle } from 'react-icons/fa';
import Form from 'react-bootstrap/Form';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const Education = ({ formData, onUpdate }) => {
  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.educations || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    onUpdate({ educations: updatedList });
  };

  const addEducation = () => {
    onUpdate({
      educations: [
        ...(formData.educations || []),
        { degree: '', institution: '', start_month: '', start_year: '', end_month: '', end_year: '' }
      ],
    });
  };

  const removeEducation = (index) => {
    const updatedList = formData.educations.filter((_, i) => i !== index);
    onUpdate({ educations: updatedList });
  };

  // Toujours au moins un bloc vide
  const educations = (formData.educations && formData.educations.length > 0)
    ? formData.educations
    : [{ degree: '', institution: '', start_month: '', start_year: '', end_month: '', end_year: '' }];

  return (
    <div className="section education-section">
      <h3 className="education-title">Éducation</h3>
      {educations.map((edu, index) => (
        <div key={index} className="education-item-modern">
          <div className="input-modern">
            <span className="input-icon"><MdSchool /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${edu.degree ? 'filled' : ''}`}>Diplôme</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleListChange(index, 'degree', e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="input-modern">
            <span className="input-icon"><FaUniversity /></span>
            <div className="input-wrapper-modern">
              <label className={`floating-label ${edu.institution ? 'filled' : ''}`}>Établissement</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleListChange(index, 'institution', e.target.value)}
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
                    value={edu.start_month || ''}
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
                    value={edu.start_year || ''}
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
                    value={edu.end_month || ''}
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
                    value={edu.end_year || ''}
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
          
          {formData.educations && formData.educations.length > 0 && (
            <div className="remove-btn-modern-wrapper">
              <button className="remove-btn-modern" onClick={() => removeEducation(index)}>
                <FaTrash style={{ marginRight: 6 }} /> Supprimer
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="add-btn-modern" onClick={addEducation} style={{ marginTop: '10px' }}>
        <FaPlusCircle className="add-btn-icon" /> Ajouter
      </button>
    </div>
  );
};

export default Education;
