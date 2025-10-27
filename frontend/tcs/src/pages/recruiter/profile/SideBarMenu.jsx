import React from 'react';
import { useLocation } from 'react-router-dom';

import {
  FaUser,
  FaAddressBook,
  FaLock,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';

import '../../candidate/profile/SidebarMenu.css';

const SidebarMenu = () => {
  const location = useLocation();
  const path = location.pathname;

  // On détecte la page settings du recruteur
  const isSettings = path === '/settings-recruiter';

  return (
    <aside className="sidebar-menu modern-sidebar animate-slide-in">
      <div className="sidebar-section">
        <h2 className="sidebar-title">{isSettings ? 'PARAMÈTRES' : 'ESPACE RECRUTEUR'}</h2>
        <ul className="sidebar-list">
          {isSettings ? (
            <>
              <li>
                <a href="#changepassword" className="active">
                  <FaLock className="sidebar-icon" />
                  <span className="sidebar-label">Mot de passe</span>
                </a>
              </li>
              <li>
                <a href="#timezone">
                  <FaClock className="sidebar-icon" />
                  <span className="sidebar-label">Fuseau horaire</span>
                </a>
              </li>
               <li>
                <a href="#deleteaccount">
                  <FaTimesCircle className="sidebar-icon" />
                  <span className="sidebar-label">Supprimer mon compte</span>
                  </a>
            </li>
            </>
          ) : (
            <>
              <li>
                <a href="#profile" className="active">
                  <FaUser className="sidebar-icon" />
                  <span className="sidebar-label">Profil</span>
                </a>
              </li>
              <li>
                <a href="#contact" className="active">
                  <FaAddressBook className="sidebar-icon" />
                  <span className="sidebar-label">Contact</span>
                </a>
              </li>
           
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default SidebarMenu;
