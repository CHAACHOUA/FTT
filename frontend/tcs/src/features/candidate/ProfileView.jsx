// src/features/candidate/ProfileView.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UploadCV from './section/UploadCV';
import Presentation from './section/Presentation';
import Contact from './section/Contact';
import Education from './section/Education';
import Experience from './section/Experience';
import Language from './section/Language';
import Skill from './section/Skill';
import SidebarMenu from './SidebarMenu';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './ProfileView.css';
import DeleteAccount from './DeleteAccount';
import ChangePassword from './ChangePassword';

const ProfileView = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  const isSettingsPage = location.pathname.startsWith('/settings');

  // ▶️ Récupération des données
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/api/candidates/profile/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setFormData(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données :", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API, accessToken]);

  const handleUpdate = (updatedData) => {
    setFormData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleCVUpload = (parsedData) => {
    console.log("Données extraites du CV :", parsedData);
    setFormData((prevData) => ({ ...prevData, ...parsedData }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/api/candidates/complete-profile/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      alert('Profil mis à jour avec succès !');
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err.message);
      alert("Une erreur s'est produite lors de l'enregistrement.");
    }
  };

  if (loading) return <div>Chargement des données...</div>;

  return (
    <div className="profile-container">
      <SidebarMenu />
      <div className="profile-content">
        {!isSettingsPage ? (
          <>
            <UploadCV onUpload={handleCVUpload} />

            <section id="presentation">
              <Presentation formData={formData} onUpdate={handleUpdate} />
            </section>

            <section id="contact">
              <Contact formData={formData} onUpdate={handleUpdate} />
            </section>

            <section id="education">
              <Education formData={formData} onUpdate={handleUpdate} />
            </section>

            <section id="experience">
              <Experience formData={formData} onUpdate={handleUpdate} />
            </section>

            <section id="language">
              <Language formData={formData} onUpdate={handleUpdate} />
            </section>

            <section id="skill">
              <Skill formData={formData} onUpdate={handleUpdate} />
            </section>

            <button className="validate-button" onClick={handleSubmit}>
              Enregistrer les modifications
            </button>
          </>
        ) : (
          <>
            <section id="changepassword">
                            <ChangePassword  />

            </section>

            <section id="deleteaccount">
                          <DeleteAccount  />

            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
