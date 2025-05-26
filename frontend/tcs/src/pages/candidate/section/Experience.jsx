// src/pages/candidate/section/Experience.jsx
import React, { useEffect } from 'react';
import '../../styles/candidate/Education.css';
import { FaBriefcase, FaBuilding, FaRegStickyNote, FaTrash, FaPlusCircle } from 'react-icons/fa';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const getMonthIndex = (monthName) => months.indexOf(monthName);
const getMonthName = (index) => months[index];
const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return { month: '', year: '' };
  const parts = dateStr.split('-');
  if (parts.length < 2) return { month: '', year: '' };
  const year = parts[0];
  const month = getMonthName(parseInt(parts[1], 10) - 1);
  return { month, year };
};

const Experience = ({ formData, onUpdate }) => {
  useEffect(() => {
    if (!formData.experiences) return;
    const updated = formData.experiences.map((exp) => {
      const { month: start_month, year: start_year } = parseDate(exp.start_date);
      const { month: end_month, year: end_year } = parseDate(exp.end_date);
      return { ...exp, start_month, start_year, end_month, end_year };
    });
    onUpdate({ experiences: updated });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDatesAndSend = (updatedList) => {
    const transformed = updatedList.map((exp) => {
      const startMonthIdx = getMonthIndex(exp.start_month);
      const endMonthIdx = getMonthIndex(exp.end_month);

      const startMonth = startMonthIdx >= 0 ? String(startMonthIdx + 1).padStart(2, '0') : '01';
      const endMonth = endMonthIdx >= 0 ? String(endMonthIdx + 1).padStart(2, '0') : '01';

      return {
        ...exp,
        start_date: exp.start_year ? `${exp.start_year}-${startMonth}-01` : null,
        end_date: exp.end_year ? `${exp.end_year}-${endMonth}-01` : null,
        start_month: exp.start_month,
        start_year: exp.start_year,
        end_month: exp.end_month,
        end_year: exp.end_year,
      };
    });
    onUpdate({ experiences: transformed });
  };

  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.experiences || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    updateDatesAndSend(updatedList);
  };

  const addExperience = () => {
    const updatedList = [
      ...(formData.experiences || []),
      {
        job_title: '',
        company: '',
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        description: '',
        start_date: null,
        end_date: null,
      },
    ];
    updateDatesAndSend(updatedList);
  };

  const removeExperience = (index) => {
    const updatedList = formData.experiences.filter((_, i) => i !== index);
    updateDatesAndSend(updatedList);
  };

  const experiences =
    formData.experiences && formData.experiences.length > 0
      ? formData.experiences
      : [
          {
            job_title: '',
            company: '',
            start_month: '',
            start_year: '',
            end_month: '',
            end_year: '',
            description: '',
            start_date: null,
            end_date: null,
          },
        ];

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

          {/* Dates */}
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

          {formData.experiences?.length > 0 && (
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