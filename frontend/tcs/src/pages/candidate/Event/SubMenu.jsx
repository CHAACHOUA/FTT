import React from 'react';
import {
  FaInfoCircle,
  FaBuilding,
  FaBriefcase,
  FaShareAlt,
  FaPrint,
  FaMap
} from 'react-icons/fa';
import '../../styles/candidate/SubMenu.css';

const SubMenu = ({ active, setActive, forumType }) => {
  const showPhysicalFeatures = forumType === 'hybrid' || forumType === 'physique';

  const menuItems = [
    { id: 'info', label: 'Informations générales', icon: <FaInfoCircle /> },
    { id: 'entreprises', label: 'Entreprises', icon: <FaBuilding /> },
    { id: 'offres', label: 'Offres', icon: <FaBriefcase /> },
    ...(showPhysicalFeatures ? [
      { id: 'plan', label: 'Plan du Forum', icon: <FaMap /> },
      { id: 'partager', label: 'Partager mon profil', icon: <FaShareAlt /> },
      { id: 'cv', label: 'Imprimer mon CV', icon: <FaPrint /> },
    ] : [])
  ];

  return (
    <div className="submenu-wrapper">
      {menuItems.map((item) => (
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
  );
};

export default SubMenu;
