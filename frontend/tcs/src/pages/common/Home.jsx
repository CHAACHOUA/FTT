import React, { useEffect, useState } from 'react';
import Navbar from './NavBar.jsx';
import Loading from './Loading';
import '../../pages/styles/common/home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faChartLine, faBuilding, faUser, faBolt, faCalendarAlt, faAward, faUsers, faCheckCircle, faBullseye, faStar } from '@fortawesome/free-solid-svg-icons';

const mockStats = {
  totalMatches: 1247,
  successRate: 78,
  companiesActive: 156,
  candidatesActive: 2340
};

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Frontend Developer',
    company: 'TechCorp',
    text: "J'ai trouvé mon job de rêve en 2 semaines ! Le système de matching est incroyable.",
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Marc D.',
    role: 'Recruteur',
    company: 'DataFlow',
    text: 'Nous avons recruté 5 personnes ce mois-ci grâce à JobDating. Efficace et rapide !',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Julie M.',
    role: 'UX Designer',
    company: 'Creative Agency',
    text: 'Une expérience révolutionnaire ! Plus besoin de CV longs, tout se joue en quelques minutes.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face'
  }
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="landing-container">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Trouvez votre <span className="hero-title-gradient">job parfait</span> en 5 minutes
            </h1>
            <p className="hero-subtitle">
              Révolutionnez votre recherche d'emploi avec notre système de matching intelligent.<br />
              Rencontrez des recruteurs en speed-dating professionnel.
            </p>
            <div className="hero-buttons">
              <button className="hero-button-primary">Je cherche un emploi</button>
              <button className="hero-button-secondary">Je recrute</button>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="stats-section visible">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="home-kpi-card">
              <div className="kpi-icon-wrapper" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <FontAwesomeIcon icon={faHeart} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value">{mockStats.totalMatches.toLocaleString()}</div>
              <div className="kpi-label">Matches réalisés</div>
              <div className="kpi-trend">+12% ce mois</div>
            </div>
            <div className="home-kpi-card">
              <div className="kpi-icon-wrapper" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <FontAwesomeIcon icon={faChartLine} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value">{mockStats.successRate}%</div>
              <div className="kpi-label">Taux de réussite</div>
              <div className="kpi-trend">+5% ce mois</div>
            </div>
            <div className="home-kpi-card">
              <div className="kpi-icon-wrapper" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <FontAwesomeIcon icon={faUsers} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value">{mockStats.companiesActive}</div>
              <div className="kpi-label">Entreprises actives</div>
              <div className="kpi-trend">+8% ce mois</div>
            </div>
            <div className="home-kpi-card">
              <div className="kpi-icon-wrapper" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <FontAwesomeIcon icon={faBullseye} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value">{mockStats.candidatesActive.toLocaleString()}</div>
              <div className="kpi-label">Candidats actifs</div>
              <div className="kpi-trend">+15% ce mois</div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="features-section visible">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Pourquoi JobDating ?</h2>
            <p className="features-subtitle">
              Découvrez les fonctionnalités qui font de JobDating la plateforme de recrutement la plus innovante.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'}}>
                <FontAwesomeIcon icon={faBolt} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="feature-title">Matching Intelligent</div>
              <div className="feature-description">Notre IA analyse vos compétences et vos préférences pour vous proposer les meilleurs matches.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'}}>
                <FontAwesomeIcon icon={faCalendarAlt} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="feature-title">Événements Live</div>
              <div className="feature-description">Participez à des sessions de job dating en présentiel ou en ligne avec plusieurs recruteurs.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #22d3ee 0%, #22c55e 100%)'}}>
                <FontAwesomeIcon icon={faUser} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="feature-title">Profils Vérifiés</div>
              <div className="feature-description">Tous les profils sont vérifiés pour garantir des rencontres authentiques et professionnelles.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #f59e42 0%, #f43f5e 100%)'}}>
                <FontAwesomeIcon icon={faAward} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="feature-title">Suivi Personnalisé</div>
              <div className="feature-description">Bénéficiez d'un accompagnement personnalisé pour optimiser votre recherche d'emploi.</div>
            </div>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section className="how-it-works-section visible">
        <div className="how-it-works-container">
          <div className="how-it-works-header">
            <h2 className="how-it-works-title">Comment ça marche ?</h2>
            <p className="how-it-works-subtitle">
              3 étapes simples pour révolutionner votre recherche d'emploi
            </p>
          </div>
          <div className="how-it-works-grid">
            <div className="how-it-works-item">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(45deg, #a855f7, #ec4899)'}}>
                  <FontAwesomeIcon icon={faUsers} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step">01</div>
              </div>
              <div className="how-it-works-item-title">Créez votre profil</div>
              <div className="how-it-works-item-description">Complétez votre profil avec vos compétences, expériences et préférences de poste.</div>
            </div>
            <div className="how-it-works-item">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}}>
                  <FontAwesomeIcon icon={faHeart} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step">02</div>
              </div>
              <div className="how-it-works-item-title">Swipez et matchez</div>
              <div className="how-it-works-item-description">Découvrez des opportunités qui vous correspondent et swipez pour matcher avec les recruteurs.</div>
            </div>
            <div className="how-it-works-item">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step">03</div>
              </div>
              <div className="how-it-works-item-title">Rencontrez-vous</div>
              <div className="how-it-works-item-description">Participez à des sessions de job dating en ligne ou en présentiel avec vos matches.</div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="testimonials-section visible">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <h2 className="testimonials-title">Ils nous font confiance</h2>
            <p className="testimonials-subtitle">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                <FontAwesomeIcon icon={faStar} key={i} className="testimonial-star" />
              ))}
            </div>
            <blockquote className="testimonial-quote">
              "{testimonials[currentTestimonial].text}"
            </blockquote>
            <div className="testimonial-author">
              <img src={testimonials[currentTestimonial].photo} alt={testimonials[currentTestimonial].name} className="testimonial-photo" />
              <div className="testimonial-author-info">
                <div className="testimonial-author-name">{testimonials[currentTestimonial].name}</div>
                <div className="testimonial-author-role">{testimonials[currentTestimonial].role}</div>
                <div className="testimonial-author-company">{testimonials[currentTestimonial].company}</div>
              </div>
            </div>
            <div className="testimonial-indicators">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`testimonial-indicator${idx === currentTestimonial ? ' active' : ''}`}
                  onClick={() => setCurrentTestimonial(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Prêt à changer votre carrière ?</h2>
          <p className="cta-subtitle">Rejoignez des milliers de professionnels qui ont déjà trouvé leur job parfait grâce à JobDating.</p>
          <div className="cta-buttons">
            <button className="cta-button-primary">Commencer maintenant</button>
            <button className="cta-button-secondary">Voir les événements</button>
          </div>
        </div>
      </section>
     
    </div>
  );
}