import React from 'react';
import {
  FaInfoCircle,
  FaBuilding,
  FaBriefcase,
  FaShareAlt,
  FaPrint,
  FaMap
} from 'react-icons/fa'; // FaMap pour l’icône du plan
import '../../styles/candidate/SubMenu.css';

const SubMenu = ({ active, setActive }) => {
  const menuItems = [
    { id: 'info', label: 'Informations générales', icon: <FaInfoCircle /> },
    { id: 'entreprises', label: 'Entreprises', icon: <FaBuilding /> },
    { id: 'offres', label: 'Offres', icon: <FaBriefcase /> },
    { id: 'plan', label: 'Plan du Forum', icon: <FaMap /> },
    { id: 'partager', label: 'Partager mon profil', icon: <FaShareAlt /> },
    { id: 'cv', label: 'Imprimer mon CV', icon: <FaPrint /> },
  ];

  return (
    <div className="submenu-wrapper">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`submenu-button ${active === item.id ? 'active' : ''}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SubMenu;
