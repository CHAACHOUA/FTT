import React, { useEffect, useState } from 'react';
import '../../../../pages/styles/candidate/Education.css';
import { FaUniversity, FaTrash, FaPlusCircle } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { validateEducationDates } from '../../../../utils/dateValidation';

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

const Education = ({ formData, onUpdate, children }) => {
  const [dateErrors, setDateErrors] = useState([]);
  useEffect(() => {
    if (!formData.educations) return;

    const needsParsing = formData.educations.some(
      (edu) =>
        (!edu.start_month || !edu.start_year) &&
        typeof edu.start_date === 'string'
    );

    if (!needsParsing) return;

    const updated = formData.educations.map((edu) => {
      const start = parseDate(edu.start_date);
      const end = parseDate(edu.end_date);
      return {
        ...edu,
        start_month: edu.start_month || start.month,
        start_year: edu.start_year || start.year,
        end_month: edu.end_month || end.month,
        end_year: edu.end_year || end.year,
      };
    });

    onUpdate({ educations: updated });
  }, [formData.educations]);

  const updateDatesAndSend = (updatedList) => {
    const transformed = updatedList.map((edu) => ({
      ...edu,
      start_date: formatDate(edu.start_month, edu.start_year),
      end_date: formatDate(edu.end_month, edu.end_year),
    }));

    onUpdate({ educations: transformed });
  };

  const handleListChange = (index, field, value) => {
    const updatedList = [...(formData.educations || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    
    // Validation des dates pour cette éducation
    const education = updatedList[index];
    const validation = validateEducationDates(education);
    if (!validation.isValid) {
      console.log('Erreurs de validation pour l\'éducation:', validation.errors);
      setDateErrors(validation.errors);
    } else {
      setDateErrors([]);
    }
    
    updateDatesAndSend(updatedList);
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
      <div className="education-header">
        <h3 className="education-title">Éducation</h3>
        <button className="add-btn-modern" onClick={addEducation}>
          <FaPlusCircle className="add-btn-icon" /> Ajouter
        </button>
      </div>
      
      {/* Affichage des erreurs de validation */}
      {dateErrors.length > 0 && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #fcc'
        }}>
          <strong>Erreurs de validation :</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {dateErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
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
      {children}
    </div>
  );
};

export default Education;
