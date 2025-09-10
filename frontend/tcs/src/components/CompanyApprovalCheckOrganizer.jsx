import React from 'react';
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';
import './CompanyApprovalCheck.css';

const CompanyApprovalCheckOrganizer = ({ company, children, fallbackMessage = "Cette action n'est pas disponible car cette entreprise n'est pas encore approuvée pour ce forum." }) => {
  // Si l'entreprise est approuvée, afficher le contenu
  if (company.approved) {
    return children;
  }

  // Si l'entreprise n'est pas approuvée, afficher le message de restriction
  return (
    <div className="approval-check-restricted">
      <div className="restricted-content">
        <FaLock className="lock-icon" />
        <h3>Action restreinte</h3>
        <p>{fallbackMessage}</p>
        <div className="restricted-info">
          <p>Approuvez d'abord cette entreprise pour accéder à cette fonctionnalité.</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyApprovalCheckOrganizer;
