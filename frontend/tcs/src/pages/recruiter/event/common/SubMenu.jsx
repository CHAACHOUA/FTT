import React from 'react';
import {
  FaBuilding,
  FaBriefcase,
  FaUsers,
  FaFolderOpen,
  FaUserCheck,
  FaCalendarAlt,
  FaVideo,
  FaUserTie,
  FaThLarge,
  FaComments
} from 'react-icons/fa';
import '../../../candidate/profile/SidebarMenu.css';
import { Button, Input, Card, Badge } from '../../../../components/common';

const SubMenu = ({ active, setActive, forum }) => {
  // Vérifier si c'est un forum virtuel
  const isVirtualForum = forum?.type === 'virtuel' || forum?.is_virtual;
  
  const allItems = [];

  // Ajouter le tableau de bord en premier si c'est un forum virtuel
  if (isVirtualForum) {
    allItems.push(
      { id: 'virtual-dashboard', label: 'Tableau de bord', icon: <FaThLarge />, section: 'virtual' }
    );
  }

  // Préparation
  allItems.push(
    { id: 'offres', label: 'Nos Offres', icon: <FaBriefcase />, section: 'preparation' },
    { id: 'entreprise', label: 'Entreprise', icon: <FaBuilding />, section: 'preparation' },
    { id: 'membres', label: 'Membres de l\'équipe', icon: <FaUsers />, section: 'preparation' }
  );

  // Jobdating
  allItems.push(
    { id: 'cvtheque', label: 'CVthèque', icon: <FaFolderOpen />, section: 'jobdating' }
  );

  // Ajouter "Mes rencontres" seulement pour les forums non-virtuels
  if (!isVirtualForum) {
    allItems.push(
      { id: 'rencontres', label: 'Mes rencontres', icon: <FaUsers />, section: 'jobdating' }
    );
  }

  // Ajouter les autres pages virtuelles si c'est un forum virtuel
  if (isVirtualForum) {
    allItems.push(
      { id: 'virtual-agenda', label: 'Agenda', icon: <FaCalendarAlt />, section: 'virtual' },
      { id: 'virtual-candidates', label: 'Candidatures', icon: <FaUserTie />, section: 'virtual' },
      { id: 'virtual-interviews', label: 'Entretiens', icon: <FaVideo />, section: 'virtual' },
      { id: 'virtual-chat', label: 'Messages', icon: <FaComments />, section: 'virtual' }
    );
  }

  return (
    <aside className="sidebar-menu modern-sidebar">
      <div className="sidebar-section">
        <h2 className="sidebar-title">MENU</h2>
        <ul className="sidebar-list">
          {allItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActive(item.id)}
                className={active === item.id ? 'active' : ''}
              >
                {React.cloneElement(item.icon, { className: 'sidebar-icon' })}
                <span className="sidebar-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SubMenu;
