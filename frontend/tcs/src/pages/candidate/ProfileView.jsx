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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../pages/common/Loading'; // ✅ Import du composant de chargement
import Navbar from '../common/NavBar';
import { validateEducationDates } from '../../utils/dateValidation';

const ProfileView = () => {



  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();
  const location = useLocation();
  const API = process.env.REACT_APP_API_BASE_URL;

  const isSettingsPage = location.pathname.startsWith('/settings');

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/api/candidates/profile/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setFormData(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erreur inconnue lors du chargement du profil.";
      toast.error(message);
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
    setFormData((prevData) => ({ ...prevData, ...parsedData }));
  };

  const handleSubmit = async () => {
    // Validation des dates avant soumission
    let hasErrors = false;
    const allErrors = [];
    
    // Validation des éducations
    if (Array.isArray(formData.educations)) {
      formData.educations.forEach((education, index) => {
        const validation = validateEducationDates(education);
        if (!validation.isValid) {
          hasErrors = true;
          allErrors.push(`Éducation ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
    }
    
    // Validation des expériences
    if (Array.isArray(formData.experiences)) {
      formData.experiences.forEach((experience, index) => {
        const validation = validateEducationDates(experience);
        if (!validation.isValid) {
          hasErrors = true;
          allErrors.push(`Expérience ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
    }
    
    // Si il y a des erreurs, afficher et arrêter
    if (hasErrors) {
      const errorMessage = allErrors.join('\n');
      toast.error(errorMessage);
      alert('Erreurs de validation des dates :\n' + errorMessage);
      return;
    }
    
    try {
      const form = new FormData();

      if (formData.profile_picture instanceof File) {
        form.append('profile_picture', formData.profile_picture);
      }

      if (formData.cv_file instanceof File) {
        form.append('cv_file', formData.cv_file);
      }

      const appendIfExists = (key, value) => {
        if (value) form.append(key, value);
      };

      appendIfExists('first_name', formData.first_name);
      appendIfExists('last_name', formData.last_name);
      appendIfExists('title', formData.title);
      appendIfExists('phone', formData.phone);
      appendIfExists('linkedin', formData.linkedin);
      appendIfExists('email', formData.email);
      appendIfExists('education_level', formData.education_level);
      appendIfExists('preferred_contract_type', formData.preferred_contract_type);
      appendIfExists('bio', formData.bio);

      if (Array.isArray(formData.educations)) {
        form.append('educations', JSON.stringify(formData.educations));
      }

      if (Array.isArray(formData.experiences)) {
        form.append('experiences', JSON.stringify(formData.experiences));
      }

      if (Array.isArray(formData.candidate_languages)) {
        form.append('candidate_languages', JSON.stringify(formData.candidate_languages));
      }

      if (Array.isArray(formData.skills)) {
        const skillsFormatted = formData.skills.map((s) =>
          typeof s === 'string' ? { name: s } : s
        );
        form.append('skills', JSON.stringify(skillsFormatted));
      }

      const res = await axios.post(`${API}/api/candidates/profile/`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        typeof res.data === 'string'
          ? res.data
          : res.data.detail || res.data.message || "Profil mis à jour avec succès !"
      );

      localStorage.setItem('name', formData.first_name || '');
      setLoading(true);
      await fetchData();
    } catch (err) {
      const resData = err.response?.data || {};
      const msg =
        resData.error ||
        resData.message ||
        err.message ||
        "Une erreur s'est produite lors de l'enregistrement.";

      toast.error(msg);
    }
  };

  // ✅ Affichage du loader si le profil est en chargement
  if (loading) return <Loading />;

  return (
    <div style={{ paddingTop: '80px' }}>
      <Navbar />
      <div className="profile-container">
        <SidebarMenu />
        <div className="profile-content">
        {!isSettingsPage ? (
          <>
            <section>
              <UploadCV onUpload={handleCVUpload} formData={formData} />
            </section>
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
              <ChangePassword />
            </section>
            <section id="deleteaccount">
              <DeleteAccount />
            </section>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default ProfileView;
