import React from 'react';
import '../../../../pages/styles/candidate/Education.css';
import { FaUniversity } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return { month: '', year: '' };
  const [year, month] = dateStr.split('-');
  const monthName = months[parseInt(month, 10) - 1];
  return { month: monthName, year };
};

const EducationProfile = ({ formData }) => {
  const educations = formData.educations?.length ? formData.educations : [];

  return (
    <div className="section education-section">
      <h3 className="education-title">Éducation</h3>

      {educations.length === 0 && (
        <p className="no-record-message">Aucune formation enregistrée.</p>
      )}

      {educations.map((edu, index) => {
        const start = parseDate(edu.start_date);
        const end = parseDate(edu.end_date);

        return (
          <div key={index} className="education-item-modern">
            <div className="input-modern read-only">
              <span className="input-icon"><MdSchool /></span>
              <div className="input-wrapper-modern">
                <label className="floating-label filled">Diplôme</label>
                <input type="text" value={edu.degree} readOnly />
              </div>
            </div>

            <div className="input-modern read-only">
              <span className="input-icon"><FaUniversity /></span>
              <div className="input-wrapper-modern">
                <label className="floating-label filled">Établissement</label>
                <input type="text" value={edu.institution} readOnly />
              </div>
            </div>

            <div className="date-grid-row">
              <div className="date-group">
                <div className="date-group-label">Début</div>
                <div className="date-grid">
                  <div className="date-select-col">
                    <label className="modern-label-date">Mois</label>
                    <input type="text" value={start.month} readOnly />
                  </div>
                  <div className="date-select-col">
                    <label className="modern-label-date">Année</label>
                    <input type="text" value={start.year} readOnly />
                  </div>
                </div>
              </div>
              <div className="date-group">
                <div className="date-group-label">Fin</div>
                <div className="date-grid">
                  <div className="date-select-col">
                    <label className="modern-label-date">Mois</label>
                    <input type="text" value={end.month} readOnly />
                  </div>
                  <div className="date-select-col">
                    <label className="modern-label-date">Année</label>
                    <input type="text" value={end.year} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EducationProfile;
