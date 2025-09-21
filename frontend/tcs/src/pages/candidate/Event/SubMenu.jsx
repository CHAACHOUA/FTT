import React from 'react';
import {
  FaInfoCircle,
  FaBuilding,
  FaBriefcase,
  FaShareAlt,
  FaPrint,
  FaMap
} from 'react-icons/fa';
import '../../candidate/SidebarMenu.css';

const SubMenu = ({ active, setActive, forumType }) => {
  const showPhysicalFeatures = forumType === 'hybride' || forumType === 'presentiel';

  const menuItems = [
    { id: 'info', label: 'Informations générales', icon: <FaInfoCircle /> },
    { id: 'entreprises', label: 'Entreprises', icon: <FaBuilding /> },
    { id: 'offres', label: 'Offres', icon: <FaBriefcase /> },
    ...(showPhysicalFeatures ? [
      { id: 'plan', label: 'Plan du Forum', icon: <FaMap /> },
      { id: 'partager', label: 'Partager mon profil', icon: <FaShareAlt /> },
    
    ] : [])
  ];

  return (
    <aside className="sidebar-menu modern-sidebar">
      <ul className="sidebar-list">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActive(item.id)}
              className="sidebar-link"
            >
              <div className="sidebar-icon">{item.icon}</div>
              <span className="sidebar-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SubMenu;
