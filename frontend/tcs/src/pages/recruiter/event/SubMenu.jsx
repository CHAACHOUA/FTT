import React from 'react';
import {
  FaInfoCircle,
  FaBuilding,
  FaBriefcase,
  FaUsers,
  FaFolderOpen,
  FaUserCheck
} from 'react-icons/fa';
import '../../styles/candidate/SubMenu.css';

const SubMenu = ({ active, setActive, sectionActive, setSectionActive }) => {
  const preparationItems = [
    { id: 'infos', label: 'Informations générales', icon: <FaInfoCircle /> },
    { id: 'offres', label: 'Nos Offres', icon: <FaBriefcase /> },
    { id: 'entreprise', label: 'Entreprise', icon: <FaBuilding /> },
    { id: 'membres', label: 'Membres de l’équipe', icon: <FaUsers /> },
  ];

  const jobdatingItems = [
    { id: 'cvtheque', label: 'CVthèque', icon: <FaFolderOpen /> },
    { id: 'matching', label: 'Matching candidats', icon: <FaUserCheck /> },
    { id: 'rencontres', label: 'Mes rencontres', icon: <FaUsers /> },

  ];

  const handleSectionClick = (section) => {
    setSectionActive(section);
    setActive('');
  };

  const currentItems = sectionActive === 'preparation' ? preparationItems : jobdatingItems;

  return (
    <div className="submenu-wrapper">
      {/* Onglets section */}
      <div className="submenu-tabs">
        <div
          className={`submenu-section-title ${sectionActive === 'preparation' ? 'active-section' : ''}`}
          onClick={() => handleSectionClick('preparation')}
        >
          Préparation
        </div>
        <div
          className={`submenu-section-title ${sectionActive === 'jobdating' ? 'active-section' : ''}`}
          onClick={() => handleSectionClick('jobdating')}
        >
          Jobdating
        </div>
      </div>

      {/* Boutons selon la section */}
      <div className="submenu-buttons-container">
        {currentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`submenu-button ${active === item.id ? 'active' : ''}`}
          >
            <div className="submenu-icon">{item.icon}</div>
            <div className="submenu-label">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubMenu;
