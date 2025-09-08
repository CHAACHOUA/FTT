import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import Presentation from './section/Presentation';
import Contact from './section/Contact';
import EducationProfile from './section/EducationProfile';
import ExperienceProfile from './section/ExperienceProfile';
import LanguageProfile from './section/LanguageProfile';
import SkillProfile from './section/SkillProfile';
import axios from 'axios';
import Loading from '../common/Loading';
import './ProfileView.css';
import Navbar from '../common/NavBar';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PublicProfileView = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const forumId = searchParams.get('forum');
        const accessToken = localStorage.getItem('access');

        const url = forumId
          ? `${API}/api/candidates/profile/public/${token}/?forum=${forumId}`
          : `${API}/api/candidates/profile/public/${token}/`;

        const response = await axios.get(url, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        });

        setFormData(response.data);
      } catch (err) {
        console.error('Erreur chargement profil public :', err);
        
        // Gestion des différents types d'erreurs
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.detail || 'Erreur inconnue';
          
          switch (status) {
            case 401:
              setError({
                type: 'auth',
                title: 'Authentification requise',
                message: 'Vous devez être connecté pour accéder à ce profil.'
              });
              break;
            case 403:
              setError({
                type: 'access',
                title: 'Accès refusé',
                message: message
              });
              break;
            case 404:
              setError({
                type: 'not_found',
                title: 'Profil introuvable',
                message: 'Ce profil candidat n\'existe pas ou n\'est plus disponible.'
              });
              break;
            default:
              setError({
                type: 'server',
                title: 'Erreur serveur',
                message: 'Une erreur est survenue lors du chargement du profil.'
              });
          }
        } else {
          setError({
            type: 'network',
            title: 'Erreur de connexion',
            message: 'Impossible de se connecter au serveur.'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API]);

  if (loading) return <Loading />;

  // Affichage des erreurs
  if (error) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={4000} />
        <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
            <div style={{ 
              backgroundColor: error.type === 'auth' ? '#fff3cd' : error.type === 'access' ? '#f8d7da' : '#d1ecf1',
              border: `1px solid ${error.type === 'auth' ? '#ffeaa7' : error.type === 'access' ? '#f5c6cb' : '#bee5eb'}`,
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                color: error.type === 'auth' ? '#856404' : error.type === 'access' ? '#721c24' : '#0c5460',
                marginBottom: '10px'
              }}>
                {error.title}
              </h2>
              <p style={{ 
                color: error.type === 'auth' ? '#856404' : error.type === 'access' ? '#721c24' : '#0c5460',
                marginBottom: '0'
              }}>
                {error.message}
              </p>
            </div>
            {error.type === 'auth' && (
              <button 
                onClick={() => window.location.href = '/login'}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      {!formData ? (
        <p className="public-error">Candidat introuvable.</p>
      ) : (
        <div style={{ paddingTop: '80px' }}>
          <Navbar />
          <div className="profile-container">
            <SidebarMenu />
            <div className="profile-content">
            <section id="presentation">
              <Presentation formData={formData} readOnly />
            </section>
            <section id="contact">
              <Contact formData={formData} readOnly />
            </section>
            <section id="education">
              <EducationProfile formData={formData} readOnly />
            </section>
            <section id="experience">
              <ExperienceProfile formData={formData} readOnly />
            </section>
            <section id="language">
              <LanguageProfile formData={formData} readOnly />
            </section>
            <section id="skill">
              <SkillProfile formData={formData} readOnly />
            </section>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default PublicProfileView;
