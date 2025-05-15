import React from 'react';
import ForumList from '../forum/ForumList';
import Navbar from '../common/NavBar.jsx';
import forums_bg from '../../assets/forums-bg.png';
import '../styles/forum/ForumView.css';

const ForumView = () => {
  return (
    <main className="forum-view">
      <Navbar />

      {/* Header visuel */}
      <section 
        className="forum-hero" 
        style={{ backgroundImage: `url(${forums_bg})` }}
      >
        <div className="forum-hero-content">
          <h1>Rencontrez vos futurs jobs.</h1>
          <p>Choisissez un forum et découvrez les entreprises participantes.</p>
        </div>
      </section>

      <ForumList />
    </main>
  );
};

export default ForumView;
