// src/pages/candidate/components/SidebarMenu.jsx

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import logo from '../../../assets/logo-digitalio.png';

import {
  FaUser,
  FaAddressBook,
  FaGraduationCap,
  FaBriefcase,
  FaLanguage,
  FaStar,
  FaFileAlt,
  FaLock,
  FaTimesCircle,
} from 'react-icons/fa';

import './SidebarMenu.css'; // si tu en as un

const SidebarMenu = () => {
  const location = useLocation();
  const path = location.pathname;

  const isSettings = path === '/settings';

  return (
    <aside className="sidebar-menu modern-sidebar animate-slide-in">
      <div className="sidebar-section">
        <h2 className="sidebar-title">{isSettings ? 'PARAMÈTRES' : 'MON PROFIL'}</h2>
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
                <a href="#deleteaccount">
                  <FaTimesCircle className="sidebar-icon" />
                  <span className="sidebar-label">Supprimer mon compte</span>
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="#uploadcv" className="active">
                  <FaFileAlt className="sidebar-icon" />
                  <span className="sidebar-label">CV</span>
                </a>
              </li>
              <li>
                <a href="#presentation">
                  <FaUser className="sidebar-icon" />
                  <span className="sidebar-label">Présentation</span>
                </a>
              </li>
              <li>
                <a href="#contact">
                  <FaAddressBook className="sidebar-icon" />
                  <span className="sidebar-label">Contact</span>
                </a>
              </li>
              <li>
                <a href="#education">
                  <FaGraduationCap className="sidebar-icon" />
                  <span className="sidebar-label">Éducation</span>
                </a>
              </li>
              <li>
                <a href="#experience">
                  <FaBriefcase className="sidebar-icon" />
                  <span className="sidebar-label">Expérience</span>
                </a>
              </li>
              <li>
                <a href="#language">
                  <FaLanguage className="sidebar-icon" />
                  <span className="sidebar-label">Langue</span>
                </a>
              </li>
              <li>
                <a href="#skill">
                  <FaStar className="sidebar-icon" />
                  <span className="sidebar-label">Compétence</span>
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
