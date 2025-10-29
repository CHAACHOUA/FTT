import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope, FaDownload } from 'react-icons/fa';
import '../../../pages/styles/candidate/CandidateProfile.css';

import Presentation from '../../../components/card/candidate/profile_section/Presentation';
import Contact from '../../../components/card/candidate/profile_section/Contact';
import EducationProfile from '../../../components/card/candidate/public_profile/EducationProfile';
import ExperienceProfile from '../../../components/card/candidate/public_profile/ExperienceProfile';
import LanguageProfile from '../../../components/card/candidate/public_profile/LanguageProfile';
import { Button, Input, Card, Badge } from '../../../components/common';
import SkillProfile from '../../../components/card/candidate/public_profile/SkillProfile';

const CandidateProfile = ({ candidateData, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animation d'entrée - pas besoin de timer
    setIsAnimating(false);
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleDownloadCV = () => {
    if (candidateData.cv_file) {
      const cvUrl = candidateData.cv_file.startsWith('http') 
        ? candidateData.cv_file 
        : `${process.env.REACT_APP_API_BASE_URL_MEDIA || 'http://localhost:8000'}${candidateData.cv_file}`;
      window.open(cvUrl, '_blank');
    }
  };

  const handleContact = () => {
    if (candidateData.email) {
      window.open(`mailto:${candidateData.email}`, '_blank');
    }
  };


  if (!candidateData) return null;

  return (
    <div className={`candidate-profile-overlay ${isAnimating ? 'animating' : ''}`} onClick={handleClose}>
      <div className={`candidate-profile-modal ${isAnimating ? 'animating' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Header simple avec boutons */}
        <div className="candidate-profile-header">
          <div className="candidate-header-actions">
            {candidateData.cv_file && (
              <button 
                className="action-btn download-btn"
                onClick={handleDownloadCV}
                title="Télécharger le CV"
              >
                <FaDownload />
              </button>
            )}
            <button className="close-button" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>
        </div>


        {/* Contenu des sections */}
        <div className="candidate-profile-content">
          <section className="profile-section">
            <Presentation formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <Contact formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <EducationProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <ExperienceProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <LanguageProfile formData={candidateData} readOnly />
          </section>
          <section className="profile-section">
            <SkillProfile formData={candidateData} readOnly />
          </section>
        </div>

        {/* Footer avec actions */}
        <div className="candidate-profile-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Fermer
          </button>
          <button className="btn-primary" onClick={handleContact}>
            <FaEnvelope />
            Contacter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
