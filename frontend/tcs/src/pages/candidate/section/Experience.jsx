import React, { useEffect } from 'react';
import '../../styles/candidate/Education.css';
import { FaBriefcase, FaBuilding, FaRegStickyNote, FaTrash, FaPlusCircle } from 'react-icons/fa';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 80 }, (_, i) => 2030 - i);

const getMonthIndex = (monthName) => months.indexOf(monthName);
const getMonthName = (index) => months[index];

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return { month: '', year: '' };
  const [year, month] = dateStr.split('-');
  return {
    month: getMonthName(parseInt(month, 10) - 1),
    year
  };
};

const formatDate = (month, year) => {
  if (!month || !year) return null;
  const m = String(getMonthIndex(month) + 1).padStart(2, '0');
  return `${year}-${m}-01`;
};

const Experience = ({ formData, onUpdate }) => {
  useEffect(() => {
    if (!formData.experiences) return;

    const needsParsing = formData.experiences.some(
      (exp) =>
        (!exp.start_month || !exp.start_year) &&
        typeof exp.start_date === 'string'
    );

    if (!needsParsing) return;

    const updated = formData.experiences.map((exp) => {
      const start = parseDate(exp.start_date);
      const end = parseDate(exp.end_date);
      return {
        ...exp,
        start_month: exp.start_month || start.month,
        start_year: exp.start_year || start.year,
        end_month: exp.end_month || end.month,
        end_year: exp.end_year || end.year,
      };
    });

    onUpdate({ experiences: updated });
  }, [formData.experiences]);

  const updateDatesAndSend = (updatedList) => {
    const transformed = updatedList.map((exp) => {
      return {
        ...exp,
        start_date: formatDate(exp.start_month, exp.start_year),
        end_date: formatDate(exp.end_month, exp.end_year),
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
        start_date: null,
        end_date: null,
        description: '',
      },
    ];
    onUpdate({ experiences: updatedList });
  };

  const removeExperience = (index) => {
    const updatedList = formData.experiences.filter((_, i) => i !== index);
    onUpdate({ experiences: updatedList });
  };

  const experiences = formData.experiences?.length
    ? formData.experiences
    : [{
        job_title: '',
        company: '',
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        start_date: null,
        end_date: null,
        description: '',
      }];

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
          <div className="date-grid-row">
            <div className="date-group">
              <div className="date-group-label">Début</div>
              <div className="date-grid">
                <div className="date-select-col">
                  <label className="modern-label-date">Mois *</label>
                  <select
                    className="modern-date-select"
                    value={exp.start_month || ''}
                    onChange={(e) => handleListChange(index, 'start_month', e.target.value)}
                  >
                    <option value="">Mois</option>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="date-select-col">
                  <label className="modern-label-date">Année *</label>
                  <select
                    className="modern-date-select"
                    value={exp.start_year || ''}
                    onChange={(e) => handleListChange(index, 'start_year', e.target.value)}
                  >
                    <option value="">Année</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
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
                    onChange={(e) => handleListChange(index, 'end_month', e.target.value)}
                  >
                    <option value="">Mois</option>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="date-select-col">
                  <label className="modern-label-date">Année *</label>
                  <select
                    className="modern-date-select"
                    value={exp.end_year || ''}
                    onChange={(e) => handleListChange(index, 'end_year', e.target.value)}
                  >
                    <option value="">Année</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
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
          <div className="remove-btn-modern-wrapper">
            <button className="remove-btn-modern" onClick={() => removeExperience(index)}>
              <FaTrash style={{ marginRight: 6 }} /> Supprimer
            </button>
          </div>
        </div>
      ))}
      <button className="add-btn-modern" onClick={addExperience} style={{ marginTop: '10px' }}>
        <FaPlusCircle className="add-btn-icon" /> Ajouter
      </button>
    </div>
  );
};

export default Experience;
