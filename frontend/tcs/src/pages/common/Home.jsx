import React from 'react';
import { Link } from 'react-router-dom';
import forums_bg from '../../assets/forums-bg.png';
import '../styles/forum/ForumView.css';

// Importation du composant Navbar
import Navbar from './NavBar.jsx'; // Assurez-vous que le chemin est correct

// Assurez-vous que le chemin vers le CSS est correct

export default function Home() {
  return (
    <div>
      {/* Intégration du Navbar */}
      <Navbar />
      <section 
        className="forum-hero" 
        style={{ backgroundImage: `url(${forums_bg})` }}
      >
        <div className="forum-hero-content">
          <h1>Rencontrez vos futurs jobs.</h1>
          <p>Choisissez un forum et découvrez les entreprises participantes.</p>
        </div>
      </section>
    </div>
  );
}
