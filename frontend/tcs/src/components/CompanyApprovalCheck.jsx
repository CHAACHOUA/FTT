import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';
import Loading from '../pages/common/Loading';
import './CompanyApprovalCheck.css';

const CompanyApprovalCheck = ({ children, forumId, apiBaseUrl, fallbackMessage = "Cette fonctionnalité n'est pas disponible car votre entreprise n'est pas encore approuvée pour ce forum." }) => {
  const [isApproved, setIsApproved] = useState(null); // null = loading, true = approved, false = not approved
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkCompanyApproval = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les informations de l'entreprise du recruteur
        const response = await axios.get(`${apiBaseUrl}/recruiters/company-profile/`, {
          withCredentials: true,
          params: {
            forum_id: forumId
          }
        });

        const companyData = response.data;
        
        // Vérifier si l'entreprise est approuvée pour ce forum
        if (companyData.approved) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification d\'approbation:', err);
        setError('Erreur lors de la vérification du statut d\'approbation');
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    if (forumId && apiBaseUrl) {
      checkCompanyApproval();
    }
  }, [forumId, apiBaseUrl]);

  // Pendant le chargement
  if (loading) {
    return <Loading />;
  }

  // En cas d'erreur
  if (error) {
    return (
      <div className="approval-check-error">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  // Si l'entreprise n'est pas approuvée
  if (!isApproved) {
    return (
      <div className="approval-check-restricted">
        <div className="restricted-content">
          <FaLock className="lock-icon" />
          <h3>Accès restreint</h3>
          <p>{fallbackMessage}</p>
          <div className="restricted-info">
            <p>Contactez l'organisateur du forum pour plus d'informations sur l'approbation de votre entreprise.</p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'entreprise est approuvée, afficher le contenu
  return children;
};

export default CompanyApprovalCheck;
