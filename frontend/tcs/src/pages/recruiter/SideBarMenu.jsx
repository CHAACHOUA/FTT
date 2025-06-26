import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import logo from '../../assets/logo-digitalio.png';

import {
  FaUser,
  FaAddressBook,
  FaBuilding,
  FaUsers,
  FaLock,
  FaTimesCircle,
} from 'react-icons/fa';

import '../candidate/SidebarMenu.css';

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
          <div className="logo-container">
            <Link to="/">
              <img src={logo} alt="Logo Digitalio" className="navbar-logo" />
            </Link>
          </div>
          {isSettings ? (
            <>
              <li>
                <a href="#changepassword" className="active">
                  <FaLock className="sidebar-icon" />
                  <span className="sidebar-label">Mot de passe</span>
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
