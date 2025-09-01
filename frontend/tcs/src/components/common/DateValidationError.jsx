import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './DateValidationError.css';

const DateValidationError = ({ errors, show = false }) => {
  if (!show || !errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="date-validation-error">
      <div className="error-header">
        <FaExclamationTriangle className="error-icon" />
        <span className="error-title">Erreurs de validation des dates</span>
      </div>
      <ul className="error-list">
        {errors.map((error, index) => (
          <li key={index} className="error-item">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DateValidationError; 