import React from 'react';
import '../styles/candidate/CandidateProfile.css'; // tu pourras ajouter du style popup/modal ici

import Presentation from './section/Presentation';
import Contact from './section/Contact';
import EducationProfile from './section/EducationProfile';
import ExperienceProfile from './section/ExperienceProfile';
import LanguageProfile from './section/LanguageProfile';
import SkillProfile from './section/SkillProfile';

const CandidateProfile = ({ candidateData, onClose }) => {
  if (!candidateData) return null;

  return (
    <div className="candidate-profile-overlay" onClick={onClose}>
      <div className="candidate-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {/* Pas besoin de SidebarMenu ici si popup, sinon tu peux l'ajouter */}
        <div className="profile-content">
          <section id="presentation">
            <Presentation formData={candidateData} readOnly />
          </section>
          <section id="contact">
            <Contact formData={candidateData} readOnly />
          </section>
          <section id="education">
            <EducationProfile formData={candidateData} readOnly />
          </section>
          <section id="experience">
            <ExperienceProfile formData={candidateData} readOnly />
          </section>
          <section id="language">
            <LanguageProfile formData={candidateData} readOnly />
          </section>
          <section id="skill">
            <SkillProfile formData={candidateData} readOnly />
          </section>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
