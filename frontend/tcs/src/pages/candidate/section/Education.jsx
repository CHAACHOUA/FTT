import React, { useEffect } from 'react';
import '../../styles/candidate/Education.css';
import { FaUniversity, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const Education = ({ formData, onUpdate }) => {
  useEffect(() => {
    if (!formData.educations) return;
    const updated = formData.educations.map((edu) => {
      // Si déjà enrichi, on laisse tel quel
      if (edu.start_month && edu.start_year && edu.end_month && edu.end_year) return edu;

      const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return { month: '', year: '' };
        const parts = dateStr.split('-');
        if (parts.length < 2) return { month: '', year: '' };
        const year = parts[0];
        const month = months[parseInt(parts[1], 10) - 1];
        return { month, year };
      };

      const { month: start_month, year: start_year } = parseDate(edu.start_date);
      const { month: end_month, year: end_year } = parseDate(edu.end_date);
      return { ...edu, start_month, start_year, end_month, end_year };
    });
    onUpdate({ educations: updated });
  }, []);

  const getMonthIndex = (monthName) => months.indexOf(monthName);
  const formatDate = (month, year) => {
    if (!month || !year) return null;
    const m = String(getMonthIndex(month) + 1).padStart(2, '0');
    return `${year}-${m}-01`;
  };

  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.educations || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };

    // Recalcule start_date / end_date
    const edu = updatedList[index];
    updatedList[index].start_date = formatDate(edu.start_month, edu.start_year);
    updatedList[index].end_date = formatDate(edu.end_month, edu.end_year);

    onUpdate({ educations: updatedList });
  };

  const addEducation = () => {
    const updatedList = [
      ...(formData.educations || []),
      {
        degree: '',
        institution: '',
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        start_date: null,
        end_date: null,
      },
    ];
    onUpdate({ educations: updatedList });
  };

  const removeEducation = (index) => {
    const updatedList = formData.educations.filter((_, i) => i !== index);
    onUpdate({ educations: updatedList });
  };

  const educations = formData.educations?.length
    ? formData.educations
    : [{
        degree: '',
        institution: '',
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        start_date: null,
        end_date: null,
      }];

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
                    value={edu.start_month || ''}
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
                    value={edu.start_year || ''}
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
                    value={edu.end_month || ''}
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
                    value={edu.end_year || ''}
                    onChange={(e) => handleListChange(index, 'end_year', e.target.value)}
                  >
                    <option value="">Année</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="remove-btn-modern-wrapper">
            <button className="remove-btn-modern" onClick={() => removeEducation(index)}>
              <FaTrash style={{ marginRight: 6 }} /> Supprimer
            </button>
          </div>
        </div>
      ))}

      <button className="add-btn-modern" onClick={addEducation} style={{ marginTop: '10px' }}>
        <FaPlusCircle className="add-btn-icon" /> Ajouter
      </button>
    </div>
  );
};

export default Education;
