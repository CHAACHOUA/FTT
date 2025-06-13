import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-digitalio.png';
import '../styles/common/navbar.css';
import { useAuth } from '../../context/AuthContext';
import { BsPerson, BsGear, BsBoxArrowRight } from 'react-icons/bs';
import { MdEventAvailable } from 'react-icons/md';

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const [name, setName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '';

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

    // Récupération du prénom stocké
    const storedName = localStorage.getItem('name');
    if (storedName) setName(storedName);

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
                <Link to="/settings" className="dropdown-item">
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
