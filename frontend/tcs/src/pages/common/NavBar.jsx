import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-digitalio.png';
import '../styles/common/navbar.css';
import { useAuth } from '../../context/AuthContext';

import { BsPerson, BsGear, BsBarChart, BsBoxArrowRight } from 'react-icons/bs';
import { MdEventAvailable } from "react-icons/md";

const Navbar = () => {
  const { isAuthenticated, role, email, logout, name } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const getInitials = (name) => {
    if (!name) return '';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Logo Digitalio" className="navbar-logo" />
        </Link>
      </div>

      <div className="navbar-right">
        {!isAuthenticated ? (
          <>
            <Link to="/signup-candidate" className="navbar-btn btn-outline">S'inscrire</Link>
            <Link to="/login" className="navbar-btn btn-primary">Se connecter</Link>
          </>
        ) : role === 'candidate' && (
          <div className="dropdown">
            <button className="navbar-user" onClick={toggleDropdown}>
              <div className="user-circle">{getInitials(name)}</div>
              <span className="user-name">{name}</span> ▾
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <BsPerson className="dropdown-icon" /> Mon profil
                </Link>
                
             <Link to="/forums" className="dropdown-item">
  <MdEventAvailable className="dropdown-icon" /> Forums
</Link>
            
                <Link to="/dashboard-candidate" className="dropdown-item">
                  <BsBarChart className="dropdown-icon" /> Dashboard
                </Link>

                    <Link to="/settings" className="dropdown-item">
                  <BsGear className="dropdown-icon" /> Paramètres
                </Link>
                <button onClick={logout} className="dropdown-item logout">
                  <BsBoxArrowRight className="dropdown-icon" /> Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
