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

const PublicProfileView = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/api/candidates/profile/public/${token}/`);
        setFormData(response.data);
      } catch (err) {
        console.error('Erreur chargement profil public :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API]);

  if (loading) return <Loading />;
  if (!formData) return <p className="public-error">Candidat introuvable ou non autorisé.</p>;

  return (
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
  );
};

export default PublicProfileView;
