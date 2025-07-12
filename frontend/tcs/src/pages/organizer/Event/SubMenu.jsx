// SubMenuOrganizer.js
import React from 'react';
import { FaBuilding, FaUsers } from 'react-icons/fa';
import '../../styles/candidate/SubMenu.css';

const SubMenu = ({ active, setActive }) => {
  const menuItems = [
    { id: 'entreprises', label: 'Entreprises', icon: <FaBuilding /> },
    { id: 'candidats', label: 'Candidats', icon: <FaUsers /> },
  ];

  return (
    <div className="submenu-wrapper">
      <div className="submenu-tabs">
        <div className="submenu-section-title active-section">Dashboard Organisateur</div>
      </div>
      <div className="submenu-buttons-container">
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
    </div>
  );
};

export default SubMenu;
