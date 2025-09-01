import React from 'react';
import {
  FaBuilding,
  FaBriefcase,
  FaUsers,
  FaFolderOpen,
  FaUserCheck
} from 'react-icons/fa';
import '../../styles/recruiter/SubMenu.css';

const SubMenu = ({ active, setActive }) => {
  const allItems = [
    // Préparation
    { id: 'offres', label: 'Nos Offres', icon: <FaBriefcase />, section: 'preparation' },
    { id: 'entreprise', label: 'Entreprise', icon: <FaBuilding />, section: 'preparation' },
    { id: 'membres', label: 'Membres de l\'équipe', icon: <FaUsers />, section: 'preparation' },
    // Jobdating
    { id: 'cvtheque', label: 'CVthèque', icon: <FaFolderOpen />, section: 'jobdating' },
    { id: 'matching', label: 'Matching candidats', icon: <FaUserCheck />, section: 'jobdating' },
    { id: 'rencontres', label: 'Mes rencontres', icon: <FaUsers />, section: 'jobdating' },
  ];

  return (
    <aside className="submenu-wrapper">
      <div className="submenu-section">
        <ul className="submenu-list">
          {allItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActive(item.id)}
                className="submenu-link"
              >
                <div className="submenu-icon">{item.icon}</div>
                <span className="submenu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SubMenu;
