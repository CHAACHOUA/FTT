import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faChartLine, faUsers, faBullseye, faBolt, faCalendarAlt, faUser, faAward, faStar, faHandshake, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import Loading from './Loading';
import { useAuth } from '../../context/AuthContext';
import '../../pages/styles/common/home.css';
import recrutement from '../../assets/recrutement.jpg';
import photo from '../../assets/photo.jpg';
import conference from '../../assets/conference.jpg';
import coaching from '../../assets/coaching.jpg';
import immersion from '../../assets/vr.jpg';
import parcours from '../../assets/parcours.jpg';
const mockStats = {
  totalOffers: 1247,
  successRate: 6,
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
  const navigate = useNavigate();
  const { role } = useAuth();
  

  const handleJobSearch = () => {
    if (role) {
      switch (role) {
        case 'organizer':
          navigate('/organizer/forums');
          break;
        case 'candidate':
          navigate('/candidate/forums');
          break;
        case 'recruiter':
          navigate('/recruiter/forums');
          break;
        default:
          navigate('/forums');
      }
    } else {
      navigate('/forums');
    }
  };

  const handleViewEvents = () => {
    if (role) {
      switch (role) {
        case 'organizer':
          navigate('/organizer/forums');
          break;
        case 'candidate':
          navigate('/candidate/forums');
          break;
        case 'recruiter':
          navigate('/recruiter/forums');
          break;
        default:
          navigate('/forums');
      }
    } else {
      navigate('/forums');
    }
  };

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
    <div className="landing-container-white">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section-white">
        <div className="hero-container">
          <div className="hero-content">
                         <h1 className="hero-title-white">
                         Connectez-vous <span className="hero-title-gradient-blue">aux entreprises</span> qui recrutent
             </h1>
            <p className="hero-subtitle-white">
              Rencontrez directement les recruteurs lors de nos forums hybrides ou virtuels.<br />
              Découvrez les opportunités qui vous correspondent.
            </p>
                                     <div className="hero-buttons">
              <button className="hero-button-primary-blue" onClick={handleJobSearch}>Je cherche un emploi</button>
          
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="stats-section-white visible">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="home-kpi-card-white">
              <div className="kpi-icon-wrapper" style={{background: '#3b82f6'}}>
                <FontAwesomeIcon icon={faHeart} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value-white">{mockStats.totalOffers}</div>
              <div className="kpi-label-white">Offres disponibles</div>
            </div>
            <div className="home-kpi-card-white">
              <div className="kpi-icon-wrapper" style={{background: '#3b82f6'}}>
                <FontAwesomeIcon icon={faChartLine} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value-white">{mockStats.successRate}</div>
              <div className="kpi-label-white">Événements </div>
            </div>
            <div className="home-kpi-card-white">
              <div className="kpi-icon-wrapper" style={{background: '#3b82f6'}}>
                <FontAwesomeIcon icon={faUsers} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value-white">{mockStats.companiesActive}</div>
              <div className="kpi-label-white">Entreprises actives</div>
            </div>
            <div className="home-kpi-card-white">
              <div className="kpi-icon-wrapper" style={{background: '#3b82f6'}}>
                <FontAwesomeIcon icon={faBullseye} style={{fontSize: '2.2rem', color: '#fff'}} />
              </div>
              <div className="kpi-value-white">{mockStats.candidatesActive.toLocaleString()}</div>
              <div className="kpi-label-white">Candidats actifs</div>
            </div>
          </div>
        </div>
      </section>
           {/* Services Section */}
           <section className="services-section-white visible">
        <div className="services-container-white">
          <div className="services-header-white">
            <h2 className="services-title-white">Nos Services</h2>
            <p className="services-subtitle-white">Découvrez comment JobDating peut vous aider dans votre carrière</p>
          </div>
                     <div className="services-grid-white">
             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={recrutement} alt="Recrutement" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faHandshake} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Recrutement</h3>
               <p className="service-description-white">
                 Les candidats ont l'opportunité de présenter leurs CV directement aux entreprises, stimulant des interactions efficaces pour le recrutement.
               </p>
             </div>
             
             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={photo} alt="Photos Professionnelles" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faCamera} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Photos Professionnelles</h3>
               <p className="service-description-white">
                 Photos professionnelles gratuites pour améliorer votre image et mettre en avant votre CV.
               </p>
             </div>
             
             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={conference} alt="Conférences Et Ateliers" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faUsers} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Conférences Et Ateliers</h3>
               <p className="service-description-white">
                 Participez à des ateliers pratiques pour optimiser votre CV, préparer vos entretiens, et assister à des conférences inspirantes animées par des experts.
               </p>
             </div>

             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={coaching} alt="Coaching Individuel" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faUser} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Coaching Individuel</h3>
               <p className="service-description-white">
                 Bénéficiez d'un accompagnement personnalisé avec des coachs experts pour optimiser votre CV, préparer vos entretiens et développer votre carrière.
               </p>
             </div>
             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={parcours} alt="Coaching Individuel" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faUser} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Parcours Adapté</h3>
               <p className="service-description-white">
               Un parcours personnalisé est proposé selon le CV de chaque candidat, permettant de découvrir les offres et entreprises correspondant le mieux à son profil et à ses centres d’intérêt.               </p>
             </div>
             <div className="service-card-white">
               <div className="service-image-container-white">
                 <img src={immersion} alt="Coaching Individuel" className="service-image-white" />
                                   <div className="service-icon-white">
                    <FontAwesomeIcon icon={faUser} style={{fontSize: '1.2rem', color: '#ffffff'}} />
                  </div>
               </div>
               <h3 className="service-title-white">Immersions Métiers</h3>
               <p className="service-description-white">
               Avec des casques de réalité virtuelle pour découvrir les métiers de demain et les innovations technologiques.               </p>
             </div>
           </div>
        </div>
      </section>
   
      {/* How it works */}
      <section className="how-it-works-section-white visible">
        <div className="how-it-works-container">
          <div className="how-it-works-header">
            <h2 className="how-it-works-title-white">Comment ça marche ?</h2>
            <p className="how-it-works-subtitle-white">
              3 étapes simples pour révolutionner votre recherche d'emploi
            </p>
          </div>
          <div className="how-it-works-grid">
            <div className="how-it-works-item-white">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}}>
                  <FontAwesomeIcon icon={faUsers} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step-white">01</div>
              </div>
              <div className="how-it-works-item-title-white">Créez votre profil</div>
              <div className="how-it-works-item-description-white">Inscris-toi et télécharge ton CV pour générer ton profil automatiquement.</div>
            </div>
            <div className="how-it-works-item-white">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}}>
                  <FontAwesomeIcon icon={faHeart} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step-white">02</div>
              </div>
              <div className="how-it-works-item-title-white">Explorez les offres</div>
              <div className="how-it-works-item-description-white">Accède aux JobDating et offres qui correspondent à tes recherches</div>
            </div>
            <div className="how-it-works-item-white">
              <div className="how-it-works-icon-container">
                <div className="how-it-works-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{fontSize: '2.2rem', color: '#fff'}} />
                </div>
                <div className="how-it-works-step-white">03</div>
              </div>
              <div className="how-it-works-item-title-white">Parcours Personnalisé</div>
              <div className="how-it-works-item-description-white">La plateforme te guide vers les entreprises adaptées à ton profil.</div>
            </div>
            
          </div>
        </div>
      </section>

 

      {/* Testimonials */}
      <section className="testimonials-section-white visible">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <h2 className="testimonials-title-white">Ils nous font confiance</h2>
            <p className="testimonials-subtitle-white">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </div>
          <div className="testimonial-card-white">
            <div className="testimonial-stars">
              {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                <FontAwesomeIcon icon={faStar} key={i} className="testimonial-star" />
              ))}
            </div>
            <blockquote className="testimonial-quote-white">
              "{testimonials[currentTestimonial].text}"
            </blockquote>
            <div className="testimonial-author">
              <img src={testimonials[currentTestimonial].photo} alt={testimonials[currentTestimonial].name} className="testimonial-photo" />
              <div className="testimonial-author-info">
                <div className="testimonial-author-name-white">{testimonials[currentTestimonial].name}</div>
                <div className="testimonial-author-role-white">{testimonials[currentTestimonial].role}</div>
                <div className="testimonial-author-company-white">{testimonials[currentTestimonial].company}</div>
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
      <section className="cta-section-white visible">
        <div className="cta-container">
          <h2 className="cta-title-white">Prêt à changer votre carrière ?</h2>
          <p className="cta-subtitle-white">Rejoignez des milliers de professionnels qui ont déjà trouvé leur job parfait grâce à JobDating.</p>
          <div className="cta-buttons-white">
            <button className="cta-button-primary-white" onClick={handleJobSearch}>Commencer maintenant</button>
            <button className="cta-button-secondary-white" onClick={handleViewEvents}>Voir les événements</button>
          </div>
        </div>
      </section>
     
    </div>
  );
}