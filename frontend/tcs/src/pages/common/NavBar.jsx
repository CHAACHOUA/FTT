import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-digitalio.png';
import '../styles/common/navbar.css';
import { useAuth } from '../../context/AuthContext';
import { BsPerson, BsGear, BsBoxArrowRight } from 'react-icons/bs';
import { MdEventAvailable } from 'react-icons/md';
// import { getUserFromToken } from "../../context/decoder-jwt"; // Fichier supprimé

const Navbar = () => {
  const { isAuthenticated, logout, name, role } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);


  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 0) {
          navbar.classList.add('navbar-blur');
        } else {
          navbar.classList.remove('navbar-blur');
        }
      }
    };

    // Ajout de l'écouteur scroll
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link to="/signup-candidate" className="navbar-signup-btn">S'inscrire</Link>
            <Link to="/login" className="navbar-login-btn">Se connecter</Link>
          </>
        ) :  (
          <div className="dropdown">
            <button className="navbar-user" onClick={toggleDropdown}>
              <div className="user-circle">{getInitials(name || 'User')}</div>
              <span className="user-name">{name || 'Utilisateur'}</span> ▾
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
               <Link
                  to={
                    role === 'recruiter'
                      ? '/recruiter/profile'
                      : role === 'organizer'
                      ? '/organizer/profile'
                      : '/candidate/profile'
                  }
                  className="dropdown-item">
              <BsPerson className="dropdown-icon" /> Mon profil
              </Link>
               <Link
  to={
    role === 'recruiter'
      ? '/recruiter/forums'
      : role === 'organizer'
      ? '/organizer/forums'
      : '/candidate/forums'
  }
  className="dropdown-item"
>
  <MdEventAvailable className="dropdown-icon" /> Forums
</Link>
               <Link
  to={
    role === 'recruiter'
      ? '/settings-recruiter'
      : role === 'organizer'
      ? '/settings-organizer'
      : '/settings'
  }
  className="dropdown-item"
>
  <BsGear className="dropdown-icon" /> Paramètres
</Link>
                <button
                  onClick={() => logout(() => navigate('/login'))}
                  className="dropdown-item logout"
                >
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
