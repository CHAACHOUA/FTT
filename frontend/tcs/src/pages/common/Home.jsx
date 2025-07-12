import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import forums_bg from '../../assets/forums-bg.png';
import '../styles/forum/ForumView.css';
import Navbar from './NavBar.jsx';
import Loading from './Loading'; // ✅ Import du spinner

export default function Home() {
  const [loading, setLoading] = useState(true); // ✅ État de chargement

  useEffect(() => {
    // Simule un délai (à remplacer par un fetch si besoin)
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />; // ✅ Affiche le spinner tant que loading est true

  return (
    <div>
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